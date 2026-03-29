import pool from '../../lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const [topComp, topBranch, statusRatio, trending] = await Promise.all([
      pool.query(`SELECT component, SUM(count) as total FROM component_data GROUP BY component ORDER BY total DESC LIMIT 3`),
      pool.query(`SELECT TRIM(branch) as branch, COUNT(*) as total FROM pcb_data WHERE branch NOT IN ('NA','nan','') GROUP BY TRIM(branch) ORDER BY total DESC LIMIT 1`),
      pool.query(`SELECT status, COUNT(*) as count FROM pcb_data GROUP BY status`),
      pool.query(`SELECT part_code, COUNT(*) as total FROM pcb_data GROUP BY part_code ORDER BY total DESC LIMIT 1`),
    ])

    const ok = statusRatio.rows.find(r => r.status === 'OK')?.count || 0
    const nff = statusRatio.rows.find(r => r.status === 'NFF')?.count || 0
    const total = parseInt(ok) + parseInt(nff)

    const insights = []

    if (topComp.rows.length > 0) {
      insights.push({ type: 'component', icon: '⚡', title: 'Top Failure Component', value: topComp.rows[0].component, detail: `${Number(topComp.rows[0].total).toLocaleString()} replacements`, color: '#ff9500' })
    }
    if (topBranch.rows.length > 0) {
      insights.push({ type: 'branch', icon: '📍', title: 'Highest Contributing City', value: topBranch.rows[0].branch, detail: `${Number(topBranch.rows[0].total).toLocaleString()} PCBs received`, color: '#00b4ff' })
    }
    if (total > 0) {
      const okRate = ((parseInt(ok) / total) * 100).toFixed(1)
      insights.push({ type: 'status', icon: okRate >= 70 ? '✅' : '⚠️', title: 'Repair Success Rate', value: `${okRate}%`, detail: `${Number(ok).toLocaleString()} OK out of ${Number(total).toLocaleString()} total`, color: parseFloat(okRate) >= 70 ? '#00e87a' : '#ff9500' })
    }
    if (trending.rows.length > 0) {
      insights.push({ type: 'trending', icon: '🔥', title: 'Most Active PCB', value: trending.rows[0].part_code, detail: `${Number(trending.rows[0].total).toLocaleString()} repair records`, color: '#a78bfa' })
    }

    res.json(insights)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
