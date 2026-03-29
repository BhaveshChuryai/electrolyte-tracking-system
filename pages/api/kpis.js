import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const [total, totalPCBs, okCount, nffCount, branches, passCount, failCount, lastUpload] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM pcb_data'),
      pool.query('SELECT COUNT(DISTINCT part_code) as count FROM pcb_data'),
      pool.query("SELECT COUNT(*) as count FROM pcb_data WHERE status = 'OK'"),
      pool.query("SELECT COUNT(*) as count FROM pcb_data WHERE status = 'NFF'"),
      pool.query("SELECT COUNT(DISTINCT branch) as count FROM pcb_data WHERE branch IS NOT NULL AND branch NOT IN ('NA','nan','')"),
      pool.query("SELECT COUNT(*) as count FROM pcb_data WHERE LOWER(testing) = 'pass'"),
      pool.query("SELECT COUNT(*) as count FROM pcb_data WHERE LOWER(testing) = 'fail'"),
      pool.query("SELECT uploaded_at, original_name FROM upload_history WHERE status='success' ORDER BY uploaded_at DESC LIMIT 1"),
    ])

    const totalVal = parseInt(total.rows[0].count)
    const okVal = parseInt(okCount.rows[0].count)
    const nffVal = parseInt(nffCount.rows[0].count)
    const passVal = parseInt(passCount.rows[0].count)
    const failVal = parseInt(failCount.rows[0].count)

    res.json({
      total_entries: totalVal,
      total_pcbs: parseInt(totalPCBs.rows[0].count),
      ok_count: okVal,
      nff_count: nffVal,
      ok_percentage: totalVal > 0 ? ((okVal / totalVal) * 100).toFixed(1) : 0,
      nff_percentage: totalVal > 0 ? ((nffVal / totalVal) * 100).toFixed(1) : 0,
      pass_count: passVal,
      fail_count: failVal,
      pass_percentage: totalVal > 0 ? ((passVal / totalVal) * 100).toFixed(1) : 0,
      total_branches: parseInt(branches.rows[0].count),
      last_upload: lastUpload.rows[0] || null,
    })
  } catch (err) {
    console.error('KPI Error:', err)
    res.status(500).json({ error: err.message })
  }
}
