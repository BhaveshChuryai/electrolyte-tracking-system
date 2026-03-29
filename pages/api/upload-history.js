import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const result = await pool.query(`
      SELECT id, original_name, total_rows, pcb_sheets, status, error_message, uploaded_at
      FROM upload_history ORDER BY uploaded_at DESC LIMIT 20
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
