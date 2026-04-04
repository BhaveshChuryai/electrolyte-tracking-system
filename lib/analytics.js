const BRANCH_TO_STATE = {
  INDORE: 'Madhya Pradesh',
  BHOPAL: 'Madhya Pradesh',
  GWALIOR: 'Madhya Pradesh',
  JABALPUR: 'Madhya Pradesh',
  JABALPR: 'Madhya Pradesh',
  LUCKNOW: 'Uttar Pradesh',
  AGRA: 'Uttar Pradesh',
  VARANASI: 'Uttar Pradesh',
  KANPUR: 'Uttar Pradesh',
  ALLAHABAD: 'Uttar Pradesh',
  PRAYAGRAJ: 'Uttar Pradesh',
  BAREILLY: 'Uttar Pradesh',
  ALIGARH: 'Uttar Pradesh',
  MEERUT: 'Uttar Pradesh',
  GORAKHPUR: 'Uttar Pradesh',
  PATNA: 'Bihar',
  BHAGALPUR: 'Bihar',
  MUZAFFARPUR: 'Bihar',
  MOTIHARI: 'Bihar',
  RAIPUR: 'Chhattisgarh',
  BHILAI: 'Chhattisgarh',
  BILASPUR: 'Chhattisgarh',
  NAGPUR: 'Maharashtra',
  NAGAPUR: 'Maharashtra',
  MUMBAI: 'Maharashtra',
  PUNE: 'Maharashtra',
  AURANGABAD: 'Maharashtra',
  AMRAVATI: 'Maharashtra',
  KOLHAPUR: 'Maharashtra',
  KOLKATA: 'West Bengal',
  BURDWAN: 'West Bengal',
  BARDHAMAN: 'West Bengal',
  SILIGURI: 'West Bengal',
  RANCHI: 'Jharkhand',
  JAMSHEDPUR: 'Jharkhand',
  DHANBAD: 'Jharkhand',
  BBSR: 'Odisha',
  BHUBANESWAR: 'Odisha',
  BALASORE: 'Odisha',
  BHADRAK: 'Odisha',
  CUTTACK: 'Odisha',
  CTC: 'Odisha',
  SAMBALPUR: 'Odisha',
  AHMEDABAD: 'Gujarat',
  SURAT: 'Gujarat',
  VADODARA: 'Gujarat',
  RAJKOT: 'Gujarat',
  AMRELI: 'Gujarat',
  CHUDA: 'Gujarat',
  GUJRAT: 'Gujarat',
  GANDHINAGAR: 'Gujarat',
  JAIPUR: 'Rajasthan',
  JODHPUR: 'Rajasthan',
  KOTA: 'Rajasthan',
  AJMER: 'Rajasthan',
  RAJPUT: 'Rajasthan',
  DELHI: 'Delhi',
  'NEW DELHI': 'Delhi',
  CHANDIGARH: 'Punjab',
  CHD: 'Punjab',
  LUDHIANA: 'Punjab',
  AMRITSAR: 'Punjab',
  JALANDHAR: 'Punjab',
  DEHRADUN: 'Uttarakhand',
  HARIDWAR: 'Uttarakhand',
  HYDERABAD: 'Telangana',
  WARANGAL: 'Telangana',
  BANGALORE: 'Karnataka',
  BNG: 'Karnataka',
  BENGALURU: 'Karnataka',
  MYSORE: 'Karnataka',
  CALICUT: 'Kerala',
  KOCHI: 'Kerala',
  TRIVANDRUM: 'Kerala',
  CHENNAI: 'Tamil Nadu',
  COIMBATORE: 'Tamil Nadu',
  MADURAI: 'Tamil Nadu',
  SILI: 'Sikkim',
}

const CITY_ALIASES = {
  BBSR: 'Bhubaneswar',
  CTC: 'Cuttack',
  CHD: 'Chandigarh',
  BNG: 'Bangalore',
  NAGAPUR: 'Nagpur',
  JABALPR: 'Jabalpur',
  BURDWAN: 'Bardhaman',
  BARDHAMAN: 'Bardhaman',
  GUJRAT: 'Gandhinagar',
  SILI: 'Siliguri',
}

const integer = (value) => Number.parseInt(value, 10) || 0

const titleCase = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase())

export const normalizeBranch = (branch) => String(branch || '').trim()

export const normalizeCity = (branch) => {
  const raw = normalizeBranch(branch)
  if (!raw) return null
  const upper = raw.toUpperCase()
  return CITY_ALIASES[upper] || titleCase(raw)
}

export const normalizeStateFromBranch = (branch) => {
  const raw = normalizeBranch(branch)
  if (!raw) return null
  return BRANCH_TO_STATE[raw.toUpperCase()] || null
}

export const buildRepairWhereClause = (filters = {}) => {
  const params = []
  const conditions = []

  if (filters.partCode && filters.partCode !== 'all') {
    params.push(filters.partCode)
    conditions.push(`part_code = $${params.length}`)
  }

  if (filters.status && filters.status !== 'all') {
    params.push(String(filters.status).toUpperCase())
    conditions.push(`UPPER(COALESCE(status, 'UNKNOWN')) = $${params.length}`)
  }

  if (filters.requireBranch !== false) {
    conditions.push(`branch IS NOT NULL`)
    conditions.push(`TRIM(branch) NOT IN ('', 'NA', 'nan', 'N/A')`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  return { params, where }
}

const createMetric = (base) => ({
  ...base,
  total: base.total || 0,
  ok: base.ok || 0,
  nff: base.nff || 0,
  wip: base.wip || 0,
})

const applyStatus = (target, status, count) => {
  target.total += count
  if (status === 'OK') target.ok += count
  else if (status === 'NFF') target.nff += count
  else target.wip += count
}

const finalizeMetric = (item) => ({
  ...item,
  okRate: item.total > 0 ? Number(((item.ok / item.total) * 100).toFixed(1)) : 0,
  nffRate: item.total > 0 ? Number(((item.nff / item.total) * 100).toFixed(1)) : 0,
  wipRate: item.total > 0 ? Number(((item.wip / item.total) * 100).toFixed(1)) : 0,
})

export const buildHierarchy = (rows = []) => {
  const states = new Map()
  const partCodes = new Map()
  const cities = []

  for (const row of rows) {
    const stateName = normalizeStateFromBranch(row.branch)
    const cityName = normalizeCity(row.branch)
    if (!stateName || !cityName) continue

    const partCode = String(row.part_code || '').trim()
    const count = integer(row.count)
    const status = String(row.status || 'UNKNOWN').toUpperCase()
    const productDescription = row.product_description || 'PCB'

    if (!states.has(stateName)) {
      states.set(
        stateName,
        createMetric({
          state: stateName,
          cityMap: new Map(),
          partCodeMap: new Map(),
        })
      )
    }

    const stateEntry = states.get(stateName)
    applyStatus(stateEntry, status, count)

    if (!stateEntry.cityMap.has(cityName)) {
      stateEntry.cityMap.set(
        cityName,
        createMetric({
          city: cityName,
          state: stateName,
          partCodeMap: new Map(),
        })
      )
    }

    const cityEntry = stateEntry.cityMap.get(cityName)
    applyStatus(cityEntry, status, count)

    if (!stateEntry.partCodeMap.has(partCode)) {
      stateEntry.partCodeMap.set(
        partCode,
        createMetric({
          partCode,
          productDescription,
          state: stateName,
        })
      )
    }
    applyStatus(stateEntry.partCodeMap.get(partCode), status, count)

    if (!cityEntry.partCodeMap.has(partCode)) {
      cityEntry.partCodeMap.set(
        partCode,
        createMetric({
          partCode,
          productDescription,
          state: stateName,
          city: cityName,
        })
      )
    }
    applyStatus(cityEntry.partCodeMap.get(partCode), status, count)

    if (!partCodes.has(partCode)) {
      partCodes.set(
        partCode,
        createMetric({
          partCode,
          productDescription,
        })
      )
    }
    applyStatus(partCodes.get(partCode), status, count)
  }

  const stateList = Array.from(states.values())
    .map((stateEntry) => {
      const cityList = Array.from(stateEntry.cityMap.values())
        .map((cityEntry) => ({
          ...finalizeMetric(cityEntry),
          partCodes: Array.from(cityEntry.partCodeMap.values())
            .map(finalizeMetric)
            .sort((a, b) => b.total - a.total || a.partCode.localeCompare(b.partCode)),
        }))
        .sort((a, b) => b.total - a.total || a.city.localeCompare(b.city))

      cities.push(...cityList)

      return {
        ...finalizeMetric(stateEntry),
        cities: cityList,
        cityCount: cityList.length,
        partCodes: Array.from(stateEntry.partCodeMap.values())
          .map(finalizeMetric)
          .sort((a, b) => b.total - a.total || a.partCode.localeCompare(b.partCode)),
      }
    })
    .sort((a, b) => b.total - a.total || a.state.localeCompare(b.state))

  const partCodeList = Array.from(partCodes.values())
    .map(finalizeMetric)
    .sort((a, b) => b.total - a.total || a.partCode.localeCompare(b.partCode))

  return {
    states: stateList,
    cities: cities.sort((a, b) => b.total - a.total || a.city.localeCompare(b.city)),
    partCodes: partCodeList,
  }
}

export const queryRepairRows = async (pool, filters = {}) => {
  const { where, params } = buildRepairWhereClause(filters)
  const result = await pool.query(
    `
      SELECT
        TRIM(branch) AS branch,
        part_code::text AS part_code,
        COALESCE(NULLIF(TRIM(status), ''), 'UNKNOWN') AS status,
        COALESCE(MAX(NULLIF(product_description, '')), 'PCB') AS product_description,
        COUNT(*)::int AS count
      FROM pcb_data
      ${where}
      GROUP BY TRIM(branch), part_code, COALESCE(NULLIF(TRIM(status), ''), 'UNKNOWN')
    `,
    params
  )
  return result.rows
}

export const queryTrends = async (pool, filters = {}) => {
  const { where, params } = buildRepairWhereClause({ ...filters, requireBranch: false })
  const result = await pool.query(
    `
      SELECT
        TO_CHAR(DATE_TRUNC('month', repair_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', repair_date) AS month_date,
        COUNT(*)::int AS total,
        SUM(CASE WHEN UPPER(COALESCE(status, 'UNKNOWN')) = 'OK' THEN 1 ELSE 0 END)::int AS ok_count,
        SUM(CASE WHEN UPPER(COALESCE(status, 'UNKNOWN')) = 'NFF' THEN 1 ELSE 0 END)::int AS nff_count,
        SUM(CASE WHEN UPPER(COALESCE(status, 'UNKNOWN')) NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END)::int AS wip_count
      FROM pcb_data
      ${where} ${where ? 'AND' : 'WHERE'} repair_date IS NOT NULL
      GROUP BY DATE_TRUNC('month', repair_date)
      ORDER BY month_date DESC
      LIMIT 12
    `,
    params
  )
  return result.rows.reverse()
}

export const queryComponents = async (pool, filters = {}, limit = 10) => {
  const params = []
  const conditions = [`component IS NOT NULL`, `TRIM(component) <> ''`]

  if (filters.partCode && filters.partCode !== 'all') {
    params.push(filters.partCode)
    conditions.push(`part_code = $${params.length}`)
  }

  params.push(limit)
  const result = await pool.query(
    `
      SELECT
        component,
        COALESCE(NULLIF(description, ''), component) AS description,
        SUM(count)::int AS total_count,
        COUNT(DISTINCT part_code)::int AS pcb_count
      FROM component_data
      WHERE ${conditions.join(' AND ')}
      GROUP BY component, COALESCE(NULLIF(description, ''), component)
      ORDER BY total_count DESC, component ASC
      LIMIT $${params.length}
    `,
    params
  )
  return result.rows
}

export const queryPartCodeDetail = async (pool, { partCode, city } = {}) => {
  const params = [partCode]
  const branchFilter = city ? ` AND TRIM(branch) = $2` : ''
  if (city) params.push(city)

  const [components, defects, sampleRows] = await Promise.all([
    pool.query(
      `
        SELECT
          component,
          COALESCE(NULLIF(description, ''), component) AS description,
          SUM(count)::int AS total_count
        FROM component_data
        WHERE part_code = $1 AND component IS NOT NULL AND TRIM(component) <> ''
        GROUP BY component, COALESCE(NULLIF(description, ''), component)
        ORDER BY total_count DESC, component ASC
        LIMIT 15
      `,
      [partCode]
    ),
    pool.query(
      `
        SELECT
          COALESCE(NULLIF(TRIM(defect), ''), 'Unspecified') AS defect,
          COUNT(*)::int AS total_count
        FROM pcb_data
        WHERE part_code = $1 ${branchFilter}
        GROUP BY COALESCE(NULLIF(TRIM(defect), ''), 'Unspecified')
        ORDER BY total_count DESC, defect ASC
        LIMIT 8
      `,
      params
    ),
    pool.query(
      `
        SELECT
          COALESCE(NULLIF(TRIM(analysis), ''), 'No analysis captured') AS analysis,
          COALESCE(NULLIF(TRIM(failure), ''), 'No failure note') AS failure,
          COALESCE(NULLIF(TRIM(rf_observation), ''), 'No observation note') AS observation,
          COALESCE(NULLIF(TRIM(branch), ''), 'Unknown City') AS branch,
          COALESCE(NULLIF(TRIM(status), ''), 'UNKNOWN') AS status,
          repair_date
        FROM pcb_data
        WHERE part_code = $1 ${branchFilter}
        ORDER BY repair_date DESC NULLS LAST, id DESC
        LIMIT 6
      `,
      params
    ),
  ])

  return {
    components: components.rows,
    defects: defects.rows,
    samples: sampleRows.rows,
  }
}

export const queryLastUpload = async (pool) => {
  const result = await pool.query(
    `
      SELECT
        uh.id,
        uh.uploaded_at,
        uh.original_name,
        uh.total_rows,
        uh.ok_rows,
        uh.nff_rows,
        uh.wip_rows,
        COALESCE(uql.auto_fixed, 0) AS auto_fixed,
        COALESCE(uql.fuzzy_fixed, 0) AS fuzzy_fixed,
        COALESCE(uql.flagged, 0) AS flagged
      FROM upload_history uh
      LEFT JOIN upload_quality_log uql ON uql.upload_id = uh.id
      WHERE uh.status = 'success'
      ORDER BY uh.uploaded_at DESC
      LIMIT 1
    `
  )
  return result.rows[0] || null
}

export const queryLatestUploadSummary = async (pool) => {
  const result = await pool.query(
    `
      SELECT
        uh.id,
        uh.original_name,
        uh.total_rows,
        uh.ok_rows,
        uh.nff_rows,
        uh.wip_rows,
        uh.uploaded_at,
        COALESCE(uql.auto_fixed, 0) AS auto_fixed,
        COALESCE(uql.fuzzy_fixed, 0) AS fuzzy_fixed,
        COALESCE(uql.flagged, 0) AS flagged
      FROM upload_history uh
      LEFT JOIN upload_quality_log uql ON uql.upload_id = uh.id
      WHERE uh.status = 'success'
      ORDER BY uh.uploaded_at DESC
      LIMIT 1
    `
  )
  return result.rows[0] || null
}
