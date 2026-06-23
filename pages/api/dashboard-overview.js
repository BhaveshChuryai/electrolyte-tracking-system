import pool from '../../lib/db'
import {
  buildDashboardAlerts,
  buildDashboardInsights,
  buildDataHealth,
  buildHierarchy,
  queryAnalyticsTotals,
  queryComponents,
  queryLastUpload,
  queryPartCodeSummary,
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
    const [repairRows, trendRows, componentRows, lastUpload, totals, partCodeRows] = await Promise.all([
      queryRepairRows(pool, filters),
      queryTrends(pool, filters),
      queryComponents(pool, filters, 10),
      queryLastUpload(pool),
      queryAnalyticsTotals(pool, filters),
      queryPartCodeSummary(pool, filters, 12),
    ])

    const hierarchy = buildHierarchy(repairRows)
    const mappedTotal = hierarchy.partCodes.reduce((sum, item) => sum + item.total, 0)
    const analyticsTotal = Number(totals.total_records || 0)
    const okCount = Number(totals.ok_count || 0)
    const nffCount = Number(totals.nff_count || 0)
    const wipCount = Number(totals.wip_count || 0)
    const topState = hierarchy.states[0] || null
    const topCity = hierarchy.cities[0] || null
    const uploadedTotal = Number(lastUpload?.total_rows || analyticsTotal)
    const ignoredTotal = Math.max(uploadedTotal - analyticsTotal, 0)
    const unmappedTotal = Math.max(analyticsTotal - mappedTotal, 0)
    const alerts = buildDashboardAlerts({ totals, mappedTotal, lastUpload })
    const insights = buildDashboardInsights({
      hierarchy,
      components: componentRows,
      partCodes: partCodeRows,
      totals,
    })
    const health = buildDataHealth({ totals, mappedTotal, lastUpload })

    res.json({
      kpis: {
        uniquePartCodes: Number(totals.unique_part_codes || 0),
        totalEntries: analyticsTotal,
        okCount,
        nffCount,
        wipCount,
        topState: topState?.state || 'No data',
        topStateCount: topState?.total || 0,
        topCity: topCity?.city || 'No data',
        topCityCount: topCity?.total || 0,
        totalCities: hierarchy.cities.length,
      },
      status: [
        { name: 'OK', value: okCount },
        { name: 'NFF', value: nffCount },
        { name: 'WIP', value: wipCount },
      ],
      trends: trendRows,
      components: componentRows,
      topStates: hierarchy.states.slice(0, 8),
      topCities: hierarchy.cities.slice(0, 8),
      topPartCodes: partCodeRows,
      filters: {
        partCodes: partCodeRows.map((item) => item.partCode),
      },
      lastUpload,
      transparency: {
        uploadedTotal,
        analyticsTotal,
        mappedTotal,
        unmappedTotal,
        ignoredTotal,
        mappedCoverage: analyticsTotal > 0 ? Number(((mappedTotal / analyticsTotal) * 100).toFixed(1)) : 0,
      },
      dataQuality: lastUpload
        ? {
            autoFixed: Number(lastUpload.auto_fixed || 0) + Number(lastUpload.fuzzy_fixed || 0),
            flagged: Number(lastUpload.flagged || 0),
            uploadedAt: lastUpload.uploaded_at,
            originalName: lastUpload.original_name,
          }
        : null,
      alerts,
      insights,
      health,
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)
    res.status(500).json({ error: error.message || 'Failed to load dashboard overview' })
  }
}
