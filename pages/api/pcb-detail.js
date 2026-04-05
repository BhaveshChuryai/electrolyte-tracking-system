import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { part_code, page = 1, limit = 10, branch, status, component } = req.query
  if (!part_code) return res.status(400).json({ error: 'part_code required' })

  const offset = (parseInt(page) - 1) * parseInt(limit)
  const params = [part_code]
  let filterClause = ''
  const normalizedStatusExpr = `UPPER(COALESCE(NULLIF(TRIM(status), ''), 'WIP'))`
  const missingComponentExpr = `UPPER(COALESCE(NULLIF(TRIM(component_change), ''), 'NA')) IN ('NA', 'N/A', 'NULL', 'NAN', '-')`

  if (branch && branch !== 'all') {
    params.push(branch)
    filterClause += ` AND TRIM(branch) = $${params.length}`
  }
  if (status && status !== 'all') {
    if (String(status).toUpperCase() === 'WIP') {
      filterClause += ` AND ${normalizedStatusExpr} NOT IN ('OK', 'NFF')`
    } else {
      params.push(String(status).toUpperCase())
      filterClause += ` AND ${normalizedStatusExpr} = $${params.length}`
    }
  }
  if (component && component !== 'all') {
    params.push(component)
    filterClause += ` AND UPPER(COALESCE(component_change, '')) LIKE '%' || UPPER($${params.length}) || '%'`
  }

  try {
    const [data, total, statusBreakdown, componentBreakdown, branchBreakdown, testingBreakdown, defectBreakdown, wipSummary, wipCities] = await Promise.all([
      pool.query(`
        SELECT * FROM pcb_data WHERE part_code = $1 ${filterClause}
        ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),

      pool.query(`SELECT COUNT(*) FROM pcb_data WHERE part_code = $1 ${filterClause}`, params),

      pool.query(`
        WITH grouped AS (
          SELECT
            CASE
              WHEN ${normalizedStatusExpr} = 'OK' THEN 'OK'
              WHEN ${normalizedStatusExpr} = 'NFF' THEN 'NFF'
              ELSE 'WIP'
            END AS status,
            COUNT(*)::int AS count
          FROM pcb_data
          WHERE part_code = $1
          GROUP BY 1
        ),
        total_rows AS (
          SELECT COALESCE(SUM(count), 0)::int AS total FROM grouped
        )
        SELECT
          statuses.status,
          COALESCE(grouped.count, 0)::int AS count,
          CASE
            WHEN total_rows.total = 0 THEN 0
            ELSE ROUND(COALESCE(grouped.count, 0) * 100.0 / total_rows.total, 1)
          END AS percentage
        FROM (VALUES ('OK'), ('NFF'), ('WIP')) AS statuses(status)
        LEFT JOIN grouped ON grouped.status = statuses.status
        CROSS JOIN total_rows
      `, [part_code]),

      pool.query(`
        SELECT component, description, count
        FROM component_data WHERE part_code = $1
        ORDER BY count DESC LIMIT 15
      `, [part_code]),

      pool.query(`
        SELECT TRIM(branch) as branch, COUNT(*) as count,
        SUM(CASE WHEN ${normalizedStatusExpr} = 'OK' THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN ${normalizedStatusExpr} = 'NFF' THEN 1 ELSE 0 END) as nff_count,
        SUM(CASE WHEN ${normalizedStatusExpr} NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END) as wip_count
        FROM pcb_data 
        WHERE part_code = $1 AND branch IS NOT NULL AND TRIM(branch) NOT IN ('NA','nan','')
        GROUP BY TRIM(branch) ORDER BY count DESC LIMIT 15
      `, [part_code]),

      pool.query(`
        SELECT LOWER(testing) as testing, COUNT(*) as count
        FROM pcb_data WHERE part_code = $1 AND testing IS NOT NULL
        GROUP BY LOWER(testing)
      `, [part_code]),

      pool.query(`
        SELECT defect, COUNT(*) as count
        FROM pcb_data 
        WHERE part_code = $1 AND defect IS NOT NULL AND defect NOT IN ('NA','nan','')
        GROUP BY defect ORDER BY count DESC LIMIT 10
      `, [part_code]),

      pool.query(`
        SELECT
          COUNT(*)::int AS total_records,
          SUM(CASE WHEN ${normalizedStatusExpr} NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END)::int AS total_wip,
          SUM(CASE WHEN ${missingComponentExpr} THEN 1 ELSE 0 END)::int AS missing_component_rows,
          SUM(CASE WHEN UPPER(COALESCE(NULLIF(TRIM(analysis), ''), 'NA')) IN ('NA', 'N/A', 'NULL', 'NAN', '-') THEN 1 ELSE 0 END)::int AS missing_analysis_rows
        FROM pcb_data
        WHERE part_code = $1
      `, [part_code]),

      pool.query(`
        SELECT
          TRIM(branch) AS branch,
          COUNT(*)::int AS total_wip
        FROM pcb_data
        WHERE part_code = $1
          AND branch IS NOT NULL
          AND TRIM(branch) NOT IN ('', 'NA', 'nan', 'N/A')
          AND ${normalizedStatusExpr} NOT IN ('OK', 'NFF')
        GROUP BY TRIM(branch)
        ORDER BY total_wip DESC, branch ASC
        LIMIT 5
      `, [part_code]),
    ])

    const master = await pool.query('SELECT * FROM pcb_master WHERE part_code = $1', [part_code])

    res.json({
      master: master.rows[0] || null,
      data: data.rows,
      total: parseInt(total.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
      status_breakdown: statusBreakdown.rows,
      component_breakdown: componentBreakdown.rows,
      branch_breakdown: branchBreakdown.rows,
      testing_breakdown: testingBreakdown.rows,
      defect_breakdown: defectBreakdown.rows,
      wip_focus: {
        total_records: parseInt(wipSummary.rows[0]?.total_records || 0, 10),
        total_wip: parseInt(wipSummary.rows[0]?.total_wip || 0, 10),
        missing_component_rows: parseInt(wipSummary.rows[0]?.missing_component_rows || 0, 10),
        missing_analysis_rows: parseInt(wipSummary.rows[0]?.missing_analysis_rows || 0, 10),
        top_wip_cities: wipCities.rows,
      },
    })
  } catch (err) {
    console.error('PCB Detail Error:', err)
    res.status(500).json({ error: err.message })
  }
}
