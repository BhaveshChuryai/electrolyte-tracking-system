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

export const normalizeStatus = (status) => {
  const value = String(status || '').trim().toUpperCase()
  if (!value || ['NULL', 'NA', 'N/A', 'NAN', 'UNKNOWN', 'PENDING', 'INCOMPLETE'].includes(value)) return 'WIP'
  if (value === 'OK') return 'OK'
  if (value === 'NFF') return 'NFF'
  return value === 'WIP' ? 'WIP' : 'WIP'
}

export const buildRepairWhereClause = (filters = {}) => {
  const params = []
  const conditions = []

  if (filters.partCode && filters.partCode !== 'all') {
    params.push(filters.partCode)
    conditions.push(`part_code = $${params.length}`)
  }

  if (filters.status && filters.status !== 'all') {
    const normalizedStatus = normalizeStatus(filters.status)
    if (normalizedStatus === 'WIP') {
      conditions.push(`UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) NOT IN ('OK', 'NFF')`)
    } else {
      params.push(normalizedStatus)
      conditions.push(`UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = $${params.length}`)
    }
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
    const status = normalizeStatus(row.status)
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
        COALESCE(NULLIF(TRIM(status), ''), 'WIP') AS status,
        COALESCE(MAX(NULLIF(product_description, '')), 'PCB') AS product_description,
        COUNT(*)::int AS count
      FROM pcb_data
      ${where}
      GROUP BY TRIM(branch), part_code, COALESCE(NULLIF(TRIM(status), ''), 'WIP')
    `,
    params
  )
  return result.rows
}

export const queryPartCodeSummary = async (pool, filters = {}, limit = 20) => {
  const { where, params } = buildRepairWhereClause({ ...filters, requireBranch: false })
  params.push(limit)

  const result = await pool.query(
    `
      SELECT
        part_code::text AS part_code,
        COALESCE(MAX(NULLIF(product_description, '')), 'PCB') AS product_description,
        COUNT(*)::int AS total,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = 'OK' THEN 1 ELSE 0 END)::int AS ok,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = 'NFF' THEN 1 ELSE 0 END)::int AS nff,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END)::int AS wip
      FROM pcb_data
      ${where}
      GROUP BY part_code
      ORDER BY total DESC, part_code ASC
      LIMIT $${params.length}
    `,
    params
  )

  return result.rows.map((row) => finalizeMetric({
    partCode: row.part_code,
    productDescription: row.product_description,
    total: integer(row.total),
    ok: integer(row.ok),
    nff: integer(row.nff),
    wip: integer(row.wip),
  }))
}

export const queryAnalyticsTotals = async (pool, filters = {}) => {
  const { where, params } = buildRepairWhereClause({ ...filters, requireBranch: false })
  const result = await pool.query(
    `
      SELECT
        COUNT(*)::int AS total_records,
        COUNT(DISTINCT part_code)::int AS unique_part_codes,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = 'OK' THEN 1 ELSE 0 END)::int AS ok_count,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = 'NFF' THEN 1 ELSE 0 END)::int AS nff_count,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END)::int AS wip_count,
        COUNT(*) FILTER (
          WHERE part_code IS NULL
            OR TRIM(COALESCE(part_code::text, '')) = ''
            OR UPPER(COALESCE(NULLIF(TRIM(component_change), ''), 'NA')) IN ('NA', 'N/A', 'NULL', 'NAN', '-')
        )::int AS incomplete_component_records
      FROM pcb_data
      ${where}
    `,
    params
  )
  return result.rows[0] || {
    total_records: 0,
    unique_part_codes: 0,
    ok_count: 0,
    nff_count: 0,
    wip_count: 0,
    incomplete_component_records: 0,
  }
}

export const queryTrends = async (pool, filters = {}) => {
  const { where, params } = buildRepairWhereClause({ ...filters, requireBranch: false })
  const result = await pool.query(
    `
      SELECT
        TO_CHAR(DATE_TRUNC('month', repair_date), 'Mon YYYY') AS month,
        DATE_TRUNC('month', repair_date) AS month_date,
        COUNT(*)::int AS total,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = 'OK' THEN 1 ELSE 0 END)::int AS ok_count,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) = 'NFF' THEN 1 ELSE 0 END)::int AS nff_count,
        SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END)::int AS wip_count
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

  const [components, defects, sampleRows, wipSummary, wipCities] = await Promise.all([
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
          UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) AS status,
          repair_date
        FROM pcb_data
        WHERE part_code = $1 ${branchFilter}
        ORDER BY repair_date DESC NULLS LAST, id DESC
        LIMIT 6
      `,
      params
    ),
    pool.query(
      `
        SELECT
          COUNT(*)::int AS total_records,
          SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END)::int AS total_wip,
          SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(component_change), ''), 'NA')) IN ('NA', 'N/A', 'NULL', 'NAN', '-') THEN 1 ELSE 0 END)::int AS missing_component_rows,
          SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(analysis), ''), 'NA')) IN ('NA', 'N/A', 'NULL', 'NAN', '-') THEN 1 ELSE 0 END)::int AS missing_analysis_rows
        FROM pcb_data
        WHERE part_code = $1 ${branchFilter}
      `,
      params
    ),
    pool.query(
      `
        SELECT
          TRIM(branch) AS branch,
          COUNT(*)::int AS total_wip
        FROM pcb_data
        WHERE part_code = $1
          ${branchFilter}
          AND branch IS NOT NULL
          AND TRIM(branch) NOT IN ('', 'NA', 'nan', 'N/A')
          AND UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP')) NOT IN ('OK', 'NFF')
        GROUP BY TRIM(branch)
        ORDER BY total_wip DESC, branch ASC
        LIMIT 5
      `,
      params
    ),
  ])

  return {
    components: components.rows,
    defects: defects.rows,
    samples: sampleRows.rows,
    wipSummary: {
      totalRecords: integer(wipSummary.rows[0]?.total_records),
      totalWip: integer(wipSummary.rows[0]?.total_wip),
      missingComponentRows: integer(wipSummary.rows[0]?.missing_component_rows),
      missingAnalysisRows: integer(wipSummary.rows[0]?.missing_analysis_rows),
    },
    wipCities: wipCities.rows,
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

const toPercent = (value, total) => (total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0)

export const buildDashboardAlerts = ({ totals, mappedTotal, lastUpload }) => {
  const alerts = []
  const totalRecords = integer(totals.total_records)
  const wipCount = integer(totals.wip_count)
  const nffCount = integer(totals.nff_count)
  const uploadedTotal = integer(lastUpload?.total_rows)
  const flagged = integer(lastUpload?.flagged)

  const wipPct = toPercent(wipCount, totalRecords)
  const nffPct = toPercent(nffCount, totalRecords)
  const mappedPct = toPercent(mappedTotal, totalRecords)
  const flaggedPct = toPercent(flagged, uploadedTotal || totalRecords)

  if (wipPct >= 30) {
    alerts.push({
      severity: 'warning',
      title: 'High WIP detected',
      description: `${wipPct}% of current analytics records are still pending or incomplete.`,
    })
  }

  if (nffPct >= 20) {
    alerts.push({
      severity: 'warning',
      title: 'NFF concentration is elevated',
      description: `${nffPct}% of records are marked NFF and may require failure review.`,
    })
  }

  if (mappedPct > 0 && mappedPct < 80) {
    alerts.push({
      severity: 'info',
      title: 'Geographic coverage is incomplete',
      description: `Only ${mappedPct}% of analytics records are currently mapped to a city/state view.`,
    })
  }

  if (flaggedPct >= 1) {
    alerts.push({
      severity: flaggedPct >= 3 ? 'warning' : 'info',
      title: 'Correction review pending',
      description: `${flagged} values from the latest upload still need review in Auto-Corrections.`,
    })
  }

  return alerts
}

export const buildDashboardInsights = ({ hierarchy, components, partCodes, totals }) => {
  const mostUsedComponent = components?.[0]
  const highestNffCity = [...(hierarchy?.cities || [])].sort((a, b) => b.nff - a.nff || b.total - a.total)[0]
  const highestWipPart = [...(partCodes || [])].sort((a, b) => b.wip - a.wip || b.total - a.total)[0]
  const topState = hierarchy?.states?.[0]

  return [
    {
      label: 'Top State By PCB Volume',
      value: topState?.state || 'No mapped state',
      detail: topState ? `${topState.total.toLocaleString('en-IN')} mapped records` : 'Upload more branch-mapped data to unlock this insight.',
    },
    {
      label: 'Highest NFF Location',
      value: highestNffCity?.city || 'No mapped city',
      detail: highestNffCity ? `${highestNffCity.nff.toLocaleString('en-IN')} NFF records` : 'No mapped NFF city pattern yet.',
    },
    {
      label: 'Most Used Component',
      value: mostUsedComponent?.component || 'No component data',
      detail: mostUsedComponent ? `${integer(mostUsedComponent.total_count).toLocaleString('en-IN')} replacements` : 'Component usage appears after upload processing.',
    },
    {
      label: 'Part Code With Highest WIP',
      value: highestWipPart?.partCode || 'No pending part code',
      detail: highestWipPart ? `${highestWipPart.wip.toLocaleString('en-IN')} pending records out of ${highestWipPart.total.toLocaleString('en-IN')}` : `${integer(totals.wip_count).toLocaleString('en-IN')} total WIP records`,
    },
  ]
}

export const buildDataHealth = ({ totals, mappedTotal, lastUpload }) => {
  const totalRecords = integer(totals.total_records)
  const uploadedTotal = integer(lastUpload?.total_rows)
  const wipPct = toPercent(integer(totals.wip_count), totalRecords)
  const mappedPct = toPercent(mappedTotal, totalRecords)
  const flaggedPct = toPercent(integer(lastUpload?.flagged), uploadedTotal || totalRecords)

  const score = Math.max(0, Math.round(100 - wipPct * 0.6 - (100 - mappedPct) * 0.25 - flaggedPct * 2))
  const tone = score >= 80 ? 'healthy' : score >= 60 ? 'watch' : 'risk'
  const message =
    tone === 'healthy'
      ? 'Data quality looks stable for enterprise reporting.'
      : tone === 'watch'
        ? 'Some pending or unmapped records may affect downstream analysis.'
        : 'High WIP or low mapping coverage is reducing analysis confidence.'

  return {
    score,
    tone,
    message,
    wipPct,
    mappedPct,
    flaggedPct,
  }
}
