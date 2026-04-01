import { useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import Layout from '../components/common/Layout'
import IndiaMap from '../components/map/IndiaMap'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const PANEL_BORDER = '1px solid rgba(148, 163, 184, 0.14)'
const tooltipStyle = {
  contentStyle: {
    background: '#08111f',
    border: PANEL_BORDER,
    borderRadius: 14,
    color: '#e2e8f0',
  },
  labelStyle: { color: '#94a3b8', fontWeight: 600 },
}

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN')

function MetricCard({ label, value, accent }) {
  return (
    <Box sx={{ p: 2, borderRadius: 4, border: PANEL_BORDER, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)' }}>
      <Typography sx={{ color: accent, fontWeight: 800, fontSize: '1.45rem' }}>{value}</Typography>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.45 }}>{label}</Typography>
    </Box>
  )
}

function ListItemCard({ title, subtitle, metrics, onClick }) {
  return (
    <Box onClick={onClick} sx={{ p: 1.35, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.62)', cursor: onClick ? 'pointer' : 'default', '&:hover': onClick ? { borderColor: 'rgba(56, 189, 248, 0.32)' } : undefined }}>
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Box>
          <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.86rem' }}>{title}</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.4 }}>{subtitle}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          {metrics.map((metric) => (
            <Typography key={metric.label} sx={{ color: metric.color, fontSize: '0.75rem', fontWeight: 600 }}>
              {metric.label}: {metric.value}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default function MapAnalyticsPage() {
  const [mapData, setMapData] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [path, setPath] = useState({ level: 'india' })

  const loadMap = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/map-data?level=india')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to load map analytics')
      setMapData(data)
      setDetail({ level: 'india', items: data.states, totalMapped: data.totalMapped })
      setPath({ level: 'india' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openLevel = async (nextPath) => {
    setDetailLoading(true)
    setPath(nextPath)
    try {
      const params = new URLSearchParams()
      params.set('level', nextPath.level)
      if (nextPath.state) params.set('state', nextPath.state)
      if (nextPath.city) params.set('city', nextPath.city)
      if (nextPath.partCode) params.set('part_code', nextPath.partCode)
      const response = await fetch(`/api/map-data?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to load drill-down')
      setDetail(data)
    } catch (err) {
      setDetail({ level: nextPath.level, error: err.message })
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => { loadMap() }, [])

  const summary =
    detail?.level === 'india'
      ? {
          total: mapData?.totalMapped || 0,
          ok: (mapData?.states || []).reduce((sum, item) => sum + item.ok, 0),
          nff: (mapData?.states || []).reduce((sum, item) => sum + item.nff, 0),
          okRate: mapData?.totalMapped ? (((mapData?.states || []).reduce((sum, item) => sum + item.ok, 0) / mapData.totalMapped) * 100).toFixed(1) : 0,
        }
      : detail?.state || detail?.city || detail?.summary

  const chartRows =
    detail?.level === 'india'
      ? (mapData?.states || []).slice(0, 10).map((item) => ({ name: item.state, total: item.total }))
      : detail?.level === 'state'
        ? (detail?.cities || []).slice(0, 10).map((item) => ({ name: item.city, total: item.total }))
        : detail?.level === 'city'
          ? (detail?.partCodes || []).slice(0, 10).map((item) => ({ name: item.partCode, total: item.total }))
          : (detail?.detail?.components || []).slice(0, 10).map((item) => ({ name: item.component, total: item.total_count }))

  return (
    <>
      <Head><title>Map Analytics - Electrolyte Bajaj</title></Head>
      <Layout onRefresh={loadMap}>
        <Box>
          <Box sx={{ p: { xs: 2.2, md: 3 }, borderRadius: 5, background: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.12), transparent 22%), linear-gradient(180deg, #0f172a 0%, #08111f 100%)', border: PANEL_BORDER, mb: 2.5 }}>
            <Typography sx={{ color: '#f8fafc', fontSize: { xs: '1.35rem', md: '1.8rem' }, fontWeight: 800 }}>India Map Analytics</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.86rem', mt: 0.7, maxWidth: 760 }}>Political-map style layout with state names on the map, density coloring, and a strict India to state to city to part code to components drill-down path.</Typography>
          </Box>

          {error ? <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>{error}</Alert> : null}
          {loading ? <LinearProgress sx={{ mb: 2.5, borderRadius: 999 }} /> : null}

          <Grid container spacing={2}>
            <Grid item xs={12} lg={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard label="States Covered" value={formatNumber(mapData?.states?.length)} accent="#38bdf8" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard label="Mapped PCBs" value={formatNumber(mapData?.totalMapped)} accent="#22c55e" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard label="Top State" value={mapData?.states?.[0]?.state || 'No data'} accent="#a78bfa" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <MetricCard label="Top Volume" value={formatNumber(mapData?.states?.[0]?.total)} accent="#f59e0b" />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ p: 2.4, borderRadius: 4, border: PANEL_BORDER, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)' }}>
                    <IndiaMap states={mapData?.states || []} activeState={path.state} onStateClick={(state) => openLevel({ level: 'state', state })} />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ p: 2.4, borderRadius: 4, border: PANEL_BORDER, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)' }}>
                    <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>{detail?.level === 'part-code' ? 'Component Consumption' : 'Hierarchy Volume'}</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.45, mb: 2 }}>Each level uses a padded chart region so bars stay fully visible and readable.</Typography>
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartRows} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                          <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), detail?.level === 'part-code' ? 'Usage' : 'PCBs']} />
                          <Bar dataKey="total" fill={detail?.level === 'part-code' ? '#38bdf8' : '#22c55e'} radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Box sx={{ p: 2.4, minHeight: 760, borderRadius: 4, border: PANEL_BORDER, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)' }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  <Button onClick={loadMap} sx={{ borderRadius: 999, border: PANEL_BORDER, color: '#cbd5e1', textTransform: 'none' }}>India</Button>
                  {path.state ? <Button onClick={() => openLevel({ level: 'state', state: path.state })} sx={{ borderRadius: 999, border: PANEL_BORDER, color: '#cbd5e1', textTransform: 'none' }}>{path.state}</Button> : null}
                  {path.city ? <Button onClick={() => openLevel({ level: 'city', state: path.state, city: path.city })} sx={{ borderRadius: 999, border: PANEL_BORDER, color: '#cbd5e1', textTransform: 'none' }}>{path.city}</Button> : null}
                </Stack>

                {detailLoading ? <LinearProgress sx={{ mb: 2, borderRadius: 999 }} /> : null}

                <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>
                  {detail?.level === 'india' ? 'State View' : detail?.level === 'state' ? `${path.state} Cities` : detail?.level === 'city' ? `${path.city} Part Codes` : `Part Code ${detail?.summary?.partCode || path.partCode}`}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.45, mb: 2 }}>The right panel keeps the drill-down readable while the map stays uncluttered.</Typography>

                {summary ? (
                  <Grid container spacing={1.2} sx={{ mb: 2 }}>
                    {[
                      { label: 'Total', value: formatNumber(summary.total), color: '#f8fafc' },
                      { label: 'OK', value: formatNumber(summary.ok), color: '#22c55e' },
                      { label: 'NFF', value: formatNumber(summary.nff), color: '#f59e0b' },
                      { label: 'OK Rate', value: `${summary.okRate || 0}%`, color: '#38bdf8' },
                    ].map((metric) => (
                      <Grid item xs={6} key={metric.label}>
                        <Box sx={{ p: 1.4, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.62)' }}>
                          <Typography sx={{ color: metric.color, fontWeight: 700, fontSize: '0.98rem' }}>{metric.value}</Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', mt: 0.4 }}>{metric.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : null}

                <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.14)', mb: 2 }} />

                <Stack spacing={1.05}>
                  {detail?.level === 'india' && (mapData?.states || []).map((item) => (
                    <ListItemCard key={item.state} title={item.state} subtitle="Click for city-wise PCB counts" metrics={[{ label: 'Total', value: formatNumber(item.total), color: '#f8fafc' }, { label: 'OK', value: formatNumber(item.ok), color: '#22c55e' }, { label: 'NFF', value: formatNumber(item.nff), color: '#f59e0b' }]} onClick={() => openLevel({ level: 'state', state: item.state })} />
                  ))}

                  {detail?.level === 'state' && (detail?.cities || []).map((item) => (
                    <ListItemCard key={item.city} title={item.city} subtitle="Click for part-code split" metrics={[{ label: 'Total', value: formatNumber(item.total), color: '#f8fafc' }, { label: 'OK', value: formatNumber(item.ok), color: '#22c55e' }, { label: 'NFF', value: formatNumber(item.nff), color: '#f59e0b' }]} onClick={() => openLevel({ level: 'city', state: path.state, city: item.city })} />
                  ))}

                  {detail?.level === 'city' && (detail?.partCodes || []).map((item) => (
                    <ListItemCard key={item.partCode} title={`Part Code ${item.partCode}`} subtitle={item.productDescription || 'PCB'} metrics={[{ label: 'Total', value: formatNumber(item.total), color: '#f8fafc' }, { label: 'OK', value: formatNumber(item.ok), color: '#22c55e' }, { label: 'NFF', value: formatNumber(item.nff), color: '#f59e0b' }]} onClick={() => openLevel({ level: 'part-code', state: path.state, city: path.city, partCode: item.partCode })} />
                  ))}

                  {detail?.level === 'part-code' && (detail?.detail?.components || []).map((item) => (
                    <ListItemCard key={item.component} title={item.component} subtitle={item.description} metrics={[{ label: 'Usage', value: formatNumber(item.total_count), color: '#38bdf8' }]} />
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  )
}
