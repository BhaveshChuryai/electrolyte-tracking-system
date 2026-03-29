import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const result = await pool.query(`
      SELECT 
        pm.part_code,
        pm.product_description,
        pm.total_entries,
        pm.dc_no,
        pm.updated_at,
        COUNT(CASE WHEN pd.status = 'OK' THEN 1 END) as ok_count,
        COUNT(CASE WHEN pd.status = 'NFF' THEN 1 END) as nff_count,
        COUNT(DISTINCT CASE WHEN pd.branch NOT IN ('NA','nan','') THEN pd.branch END) as branch_count,
        ROUND(COUNT(CASE WHEN pd.status = 'OK' THEN 1 END) * 100.0 / NULLIF(COUNT(pd.id), 0), 1) as ok_rate
      FROM pcb_master pm
      LEFT JOIN pcb_data pd ON pm.part_code = pd.part_code
      GROUP BY pm.part_code, pm.product_description, pm.total_entries, pm.dc_no, pm.updated_at
      ORDER BY pm.total_entries DESC
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
