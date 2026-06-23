import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { part_code } = req.query

  try {
    let query = `
      SELECT COALESCE(NULLIF(TRIM(status), ''), 'WIP') as status, COUNT(*) as count,
      ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 1) as percentage
      FROM pcb_data WHERE status IS NOT NULL AND status != ''
    `
    const params = []
    if (part_code && part_code !== 'all') {
      query += ` AND part_code = $1`
      params.push(part_code)
    }
    query += ` GROUP BY COALESCE(NULLIF(TRIM(status), ''), 'WIP') ORDER BY count DESC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
