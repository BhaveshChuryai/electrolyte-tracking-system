import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all flagged values pending review, plus correction stats
    const { type = 'flagged', field, status = 'pending' } = req.query
    try {
      if (type === 'flagged') {
        const params = []
        let where = `WHERE fv.status = $1`
        params.push(status)
        if (field) { params.push(field); where += ` AND fv.field = $${params.length}` }

        const result = await pool.query(`
          SELECT fv.*,
            CASE WHEN c.id IS NOT NULL THEN true ELSE false END as has_correction
          FROM flagged_values fv
          LEFT JOIN corrections c ON c.field = fv.field AND c.original_value = fv.original_value
          ${where}
          ORDER BY fv.occurrences DESC, fv.confidence DESC, fv.created_at DESC
        `, params)
        return res.json({ flagged: result.rows, total: result.rows.length })
      }

      if (type === 'corrections') {
        const result = await pool.query(`
          SELECT * FROM corrections
          WHERE status IN ('approved', 'auto-approved')
          ORDER BY times_applied DESC, field, original_value
        `)
        return res.json({ corrections: result.rows, total: result.rows.length })
      }

      if (type === 'stats') {
        const [flagged, corrections, quality, latestUpload] = await Promise.all([
          pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status='pending') as pending, COUNT(*) FILTER (WHERE status='approved') as approved FROM flagged_values`),
          pool.query(`SELECT COUNT(*) as total, SUM(times_applied) as total_applied FROM corrections WHERE status IN ('approved', 'auto-approved')`),
          pool.query(`SELECT SUM(auto_fixed) as auto_fixed, SUM(fuzzy_fixed) as fuzzy_fixed, SUM(flagged) as flagged FROM upload_quality_log`),
          pool.query(`
            SELECT
              uh.id,
              uh.original_name,
              uh.total_rows,
              uh.ok_rows,
              uh.nff_rows,
              uh.wip_rows,
              uh.uploaded_at,
              COALESCE(uql.auto_fixed, 0) as auto_fixed,
              COALESCE(uql.fuzzy_fixed, 0) as fuzzy_fixed,
              COALESCE(uql.flagged, 0) as flagged
            FROM upload_history uh
            LEFT JOIN upload_quality_log uql ON uql.upload_id = uh.id
            WHERE uh.status = 'success'
            ORDER BY uh.uploaded_at DESC
            LIMIT 1
          `),
        ])
        return res.json({
          flagged: flagged.rows[0],
          corrections: corrections.rows[0],
          quality: quality.rows[0],
          latestUpload: latestUpload.rows[0] || null,
        })
      }
    } catch (err) { return res.status(500).json({ error: err.message }) }
  }

  if (req.method === 'POST') {
    // Approve or reject a flagged value
    const { flagId, action, correctedValue, field, originalValue } = req.body
    try {
      if (action === 'approve') {
        const finalValue = correctedValue
        if (!finalValue) return res.status(400).json({ error: 'correctedValue required for approval' })

        // Save to corrections table
        await pool.query(`
          INSERT INTO corrections (field, original_value, corrected_value, confidence, method, status, approved_by)
          VALUES ($1, $2, $3, 95, 'manual', 'approved', 'admin')
          ON CONFLICT (field, original_value)
          DO UPDATE SET corrected_value = EXCLUDED.corrected_value,
                        status = 'approved', approved_by = 'admin', updated_at = NOW()
        `, [field, originalValue, finalValue])

        // Mark flagged as approved
        await pool.query(`
          UPDATE flagged_values SET status = 'approved', updated_at = NOW() WHERE id = $1
        `, [flagId])

        return res.json({ success: true, message: `"${originalValue}" → "${finalValue}" saved. Will auto-fix in future uploads.` })
      }

      if (action === 'reject') {
        await pool.query(`UPDATE flagged_values SET status = 'rejected', updated_at = NOW() WHERE id = $1`, [flagId])
        // Also save as "ignore" correction so system stops flagging it
        await pool.query(`
          INSERT INTO corrections (field, original_value, corrected_value, confidence, method, status)
          VALUES ($1, $2, $2, 100, 'manual', 'approved')
          ON CONFLICT (field, original_value) DO UPDATE SET status='approved', updated_at=NOW()
        `, [field, originalValue])
        return res.json({ success: true, message: 'Value rejected — will not be flagged again.' })
      }

      if (action === 'ignore') {
        await pool.query(`UPDATE flagged_values SET status = 'ignored', updated_at = NOW() WHERE id = $1`, [flagId])
        return res.json({ success: true })
      }
    } catch (err) { return res.status(500).json({ error: err.message }) }
  }

  if (req.method === 'DELETE') {
    // Delete a correction rule
    const { id } = req.query
    try {
      await pool.query(`DELETE FROM corrections WHERE id = $1`, [id])
      return res.json({ success: true })
    } catch (err) { return res.status(500).json({ error: err.message }) }
  }

  res.status(405).json({ error: 'Method not allowed' })
}
