import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { part_code } = req.query

  try {
    let query = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', repair_date), 'Mon YYYY') as month,
        DATE_TRUNC('month', repair_date) as month_date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'OK' THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN status = 'NFF' THEN 1 ELSE 0 END) as nff_count,
        SUM(CASE WHEN LOWER(testing) = 'pass' THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN LOWER(testing) = 'fail' THEN 1 ELSE 0 END) as fail_count
      FROM pcb_data WHERE repair_date IS NOT NULL
    `
    const params = []
    if (part_code && part_code !== 'all') {
      query += ` AND part_code = $1`
      params.push(part_code)
    }
    query += ` GROUP BY DATE_TRUNC('month', repair_date) ORDER BY month_date DESC LIMIT 12`

    const result = await pool.query(query, params)
    res.json(result.rows.reverse())
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
