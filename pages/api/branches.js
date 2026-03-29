import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { part_code, limit = 20 } = req.query

  try {
    let query = `
      SELECT 
        TRIM(branch) as branch,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN status = 'NFF' THEN 1 ELSE 0 END) as nff_count,
        ROUND(SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as ok_rate
      FROM pcb_data
      WHERE branch IS NOT NULL 
        AND TRIM(branch) NOT IN ('NA','nan','','N/A')
    `
    const params = []
    if (part_code && part_code !== 'all') {
      query += ` AND part_code = $1`
      params.push(part_code)
    }
    query += ` GROUP BY TRIM(branch) ORDER BY total DESC LIMIT $${params.length + 1}`
    params.push(parseInt(limit))

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
