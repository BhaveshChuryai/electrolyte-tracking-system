import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const result = await pool.query(`
      SELECT
        uh.id,
        uh.original_name,
        uh.total_rows,
        uh.ok_rows,
        uh.nff_rows,
        uh.wip_rows,
        uh.pcb_sheets,
        uh.status,
        uh.error_message,
        uh.uploaded_at,
        COALESCE(uql.auto_fixed, 0) AS auto_fixed,
        COALESCE(uql.fuzzy_fixed, 0) AS fuzzy_fixed,
        COALESCE(uql.flagged, 0) AS flagged
      FROM upload_history uh
      LEFT JOIN upload_quality_log uql ON uql.upload_id = uh.id
      ORDER BY uh.uploaded_at DESC
      LIMIT 20
    `)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
