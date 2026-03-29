import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { part_code, limit = 15 } = req.query

  try {
    let query = `
      SELECT component, description, SUM(count) as total_count,
      COUNT(DISTINCT part_code) as pcb_count
      FROM component_data WHERE component IS NOT NULL AND component != ''
    `
    const params = []
    if (part_code && part_code !== 'all') {
      query += ` AND part_code = $1`
      params.push(part_code)
    }
    query += ` GROUP BY component, description ORDER BY total_count DESC LIMIT $${params.length + 1}`
    params.push(parseInt(limit))

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
