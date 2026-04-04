import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { part_code, page = 1, limit = 10, branch, status, component } = req.query
  if (!part_code) return res.status(400).json({ error: 'part_code required' })

  const offset = (parseInt(page) - 1) * parseInt(limit)
  const params = [part_code]
  let filterClause = ''

  if (branch && branch !== 'all') {
    params.push(branch)
    filterClause += ` AND TRIM(branch) = $${params.length}`
  }
  if (status && status !== 'all') {
    params.push(status)
    filterClause += ` AND status = $${params.length}`
  }
  if (component && component !== 'all') {
    params.push(component)
    filterClause += ` AND UPPER(COALESCE(component_change, '')) LIKE '%' || UPPER($${params.length}) || '%'`
  }

  try {
    const [data, total, statusBreakdown, componentBreakdown, branchBreakdown, testingBreakdown, defectBreakdown] = await Promise.all([
      pool.query(`
        SELECT * FROM pcb_data WHERE part_code = $1 ${filterClause}
        ORDER BY id LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `, [...params, limit, offset]),

      pool.query(`SELECT COUNT(*) FROM pcb_data WHERE part_code = $1 ${filterClause}`, params),

      pool.query(`
        SELECT status, COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
        FROM pcb_data WHERE part_code = $1 GROUP BY status
      `, [part_code]),

      pool.query(`
        SELECT component, description, count
        FROM component_data WHERE part_code = $1
        ORDER BY count DESC LIMIT 15
      `, [part_code]),

      pool.query(`
        SELECT TRIM(branch) as branch, COUNT(*) as count,
        SUM(CASE WHEN status='OK' THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN status='NFF' THEN 1 ELSE 0 END) as nff_count,
        SUM(CASE WHEN COALESCE(status, 'WIP') NOT IN ('OK', 'NFF') THEN 1 ELSE 0 END) as wip_count
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
    })
  } catch (err) {
    console.error('PCB Detail Error:', err)
    res.status(500).json({ error: err.message })
  }
}
