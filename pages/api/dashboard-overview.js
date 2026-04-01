import pool from '../../lib/db'
import {
  buildHierarchy,
  queryComponents,
  queryLastUpload,
  queryRepairRows,
  queryTrends,
} from '../../lib/analytics'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const filters = {
    partCode: req.query.part_code,
    status: req.query.status,
  }

  try {
    const [repairRows, trendRows, componentRows, lastUpload] = await Promise.all([
      queryRepairRows(pool, filters),
      queryTrends(pool, filters),
      queryComponents(pool, filters, 10),
      queryLastUpload(pool),
    ])

    const hierarchy = buildHierarchy(repairRows)
    const totalEntries = hierarchy.partCodes.reduce((sum, item) => sum + item.total, 0)
    const okCount = hierarchy.partCodes.reduce((sum, item) => sum + item.ok, 0)
    const nffCount = hierarchy.partCodes.reduce((sum, item) => sum + item.nff, 0)
    const topState = hierarchy.states[0] || null
    const topCity = hierarchy.cities[0] || null

    res.json({
      kpis: {
        totalPcbs: hierarchy.partCodes.length,
        totalEntries,
        okCount,
        nffCount,
        topState: topState?.state || 'No data',
        topStateCount: topState?.total || 0,
        topCity: topCity?.city || 'No data',
        topCityCount: topCity?.total || 0,
        totalCities: hierarchy.cities.length,
      },
      status: [
        { name: 'OK', value: okCount },
        { name: 'NFF', value: nffCount },
      ],
      trends: trendRows,
      components: componentRows,
      topStates: hierarchy.states.slice(0, 8),
      topCities: hierarchy.cities.slice(0, 8),
      topPartCodes: hierarchy.partCodes.slice(0, 12),
      filters: {
        partCodes: hierarchy.partCodes.map((item) => item.partCode),
      },
      lastUpload,
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)
    res.status(500).json({ error: error.message || 'Failed to load dashboard overview' })
  }
}
