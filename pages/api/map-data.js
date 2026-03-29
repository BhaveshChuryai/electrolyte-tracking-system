import pool from '../../lib/db'

// State name mapping from branch names in data
const BRANCH_TO_STATE = {
  'INDORE': 'Madhya Pradesh', 'BHOPAL': 'Madhya Pradesh', 'GWALIOR': 'Madhya Pradesh',
  'LUCKNOW': 'Uttar Pradesh', 'AGRA': 'Uttar Pradesh', 'VARANASI': 'Uttar Pradesh',
  'KANPUR': 'Uttar Pradesh', 'ALLAHABAD': 'Uttar Pradesh', 'BAREILLY': 'Uttar Pradesh',
  'ALIGARH': 'Uttar Pradesh', 'MEERUT': 'Uttar Pradesh',
  'PATNA': 'Bihar', 'BHAGALPUR': 'Bihar', 'MUZAFFARPUR': 'Bihar', 'MOTIHARI': 'Bihar',
  'RAIPUR': 'Chhattisgarh', 'BHILAI': 'Chhattisgarh', 'BILASPUR': 'Chhattisgarh',
  'NAGPUR': 'Maharashtra', 'NAGAPUR': 'Maharashtra', 'MUMBAI': 'Maharashtra',
  'PUNE': 'Maharashtra', 'AURANGABAD': 'Maharashtra', 'AMRAVATI': 'Maharashtra',
  'KOLKATA': 'West Bengal', 'BURDWAN': 'West Bengal', 'BBSR': 'Odisha',
  'BHUBANESWAR': 'Odisha', 'BALASORE': 'Odisha', 'BHADRAK': 'Odisha',
  'CUTTACK': 'Odisha', 'CTC': 'Odisha', 'SAMBALPUR': 'Odisha',
  'RANCHI': 'Jharkhand', 'JAMSHEDPUR': 'Jharkhand', 'DHANBAD': 'Jharkhand',
  'JABALPUR': 'Madhya Pradesh', 'JABALPR': 'Madhya Pradesh',
  'AHMEDABAD': 'Gujarat', 'SURAT': 'Gujarat', 'VADODARA': 'Gujarat',
  'RAJKOT': 'Gujarat', 'AMRELI': 'Gujarat', 'CHUDA': 'Gujarat',
  'GUJRAT': 'Gujarat', 'GANDHINAGAR': 'Gujarat',
  'JAIPUR': 'Rajasthan', 'JODHPUR': 'Rajasthan', 'KOTA': 'Rajasthan',
  'AJMER': 'Rajasthan', 'RAJPUT': 'Rajasthan',
  'DELHI': 'Delhi', 'NEW DELHI': 'Delhi',
  'CHANDIGARH': 'Punjab', 'CHD': 'Punjab', 'LUDHIANA': 'Punjab',
  'AMRITSAR': 'Punjab', 'JALANDHAR': 'Punjab',
  'DEHRADUN': 'Uttarakhand', 'HARIDWAR': 'Uttarakhand',
  'HYDERABAD': 'Telangana', 'WARANGAL': 'Telangana',
  'BANGALORE': 'Karnataka', 'BNG': 'Karnataka', 'MYSORE': 'Karnataka',
  'CALICUT': 'Kerala', 'KOCHI': 'Kerala', 'TRIVANDRUM': 'Kerala',
  'CHENNAI': 'Tamil Nadu', 'COIMBATORE': 'Tamil Nadu', 'MADURAI': 'Tamil Nadu',
  'BHUBANESWAR': 'Odisha', 'KOLHAPUR': 'Maharashtra',
  'GORAKHPUR': 'Uttar Pradesh', 'SILI': 'Sikkim',
  'BARDHAMAN': 'West Bengal', 'Bardhaman': 'West Bengal',
  'SILI': 'Sikkim', 'SILIGURI': 'West Bengal',
}

const normalize = (b) => {
  if (!b) return null
  const upper = b.toUpperCase().trim()
  return BRANCH_TO_STATE[upper] || BRANCH_TO_STATE[b.trim()] || null
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const { state, part_code } = req.query

  try {
    let pcFilter = ''
    const params = []
    if (part_code && part_code !== 'all') {
      params.push(part_code)
      pcFilter = ` AND part_code = $${params.length}`
    }

    // Get all branch data
    const result = await pool.query(`
      SELECT TRIM(branch) as branch, status, COUNT(*) as count
      FROM pcb_data
      WHERE branch IS NOT NULL AND TRIM(branch) NOT IN ('NA','nan','','N/A')
      ${pcFilter}
      GROUP BY TRIM(branch), status
    `, params)

    if (state) {
      // Return city-level data for a specific state
      const cityData = {}
      result.rows.forEach(row => {
        const s = normalize(row.branch)
        if (s === state) {
          const city = row.branch.trim()
          if (!cityData[city]) cityData[city] = { city, total: 0, ok: 0, nff: 0 }
          cityData[city].total += parseInt(row.count)
          if (row.status === 'OK') cityData[city].ok += parseInt(row.count)
          if (row.status === 'NFF') cityData[city].nff += parseInt(row.count)
        }
      })
      return res.json({
        type: 'city',
        state,
        cities: Object.values(cityData).sort((a, b) => b.total - a.total)
      })
    }

    // Return state-level aggregated data
    const stateData = {}
    result.rows.forEach(row => {
      const s = normalize(row.branch)
      if (!s) return
      if (!stateData[s]) stateData[s] = { state: s, total: 0, ok: 0, nff: 0, cities: new Set() }
      stateData[s].total += parseInt(row.count)
      if (row.status === 'OK') stateData[s].ok += parseInt(row.count)
      if (row.status === 'NFF') stateData[s].nff += parseInt(row.count)
      stateData[s].cities.add(row.branch.trim())
    })

    const states = Object.values(stateData).map(s => ({
      ...s, cities: s.cities.size, ok_rate: s.total > 0 ? ((s.ok / s.total) * 100).toFixed(1) : 0
    })).sort((a, b) => b.total - a.total)

    res.json({ type: 'state', states, total_mapped: states.reduce((s, x) => s + x.total, 0) })
  } catch (err) {
    console.error('Map data error:', err)
    res.status(500).json({ error: err.message })
  }
}
