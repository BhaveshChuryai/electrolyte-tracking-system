import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Box, Typography, Grid, Alert, Button, Chip, Skeleton } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import { useRouter } from 'next/router'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell, PieChart, Pie } from 'recharts'
import Layout from '../components/common/Layout'
import KPICards from '../components/dashboard/KPICards'
import FilterBar from '../components/dashboard/FilterBar'
import DataTable from '../components/dashboard/DataTable'
import InsightsPanel from '../components/dashboard/InsightsPanel'

const TT = {
  contentStyle: { background: '#0a1628', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '10px 14px' }
}

const COLORS = ['#00e87a','#ff9500','#00b4ff','#a78bfa','#ff4d4d','#00ffcc','#ffdd00']

function ChartCard({ title, sub, children, loading, h = 260 }) {
  if (loading) return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <Skeleton variant="text" width="45%" height={20} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.4 }} />
      <Skeleton variant="text" width="65%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2 }} />
      <Skeleton variant="rounded" height={h} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
    </Box>
  )
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #0f1e38)', border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff', mb: 0.2 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.63rem', color: 'rgba(120,160,210,0.4)', mb: 2 }}>{sub}</Typography>
      {children}
    </Box>
  )
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800}>{`${(percent*100).toFixed(0)}%`}</text>
}

export default function DashboardPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState(null)
  const [statusData, setStatusData] = useState([])
  const [componentData, setComponentData] = useState([])
  const [branchData, setBranchData] = useState([])
  const [trendsData, setTrendsData] = useState([])
  const [tableData, setTableData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [noData, setNoData] = useState(false)
  const [filters, setFilters] = useState({ status: 'all', part_code: 'all', search: '' })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    setNoData(false)
    try {
      const p = new URLSearchParams()
      if (filters.part_code !== 'all') p.append('part_code', filters.part_code)
      if (filters.status !== 'all') p.append('status', filters.status)
      const q = p.toString() ? `?${p}` : ''

      const [kpiR, stR, cmpR, brR, trR, pcbR] = await Promise.allSettled([
        fetch('/api/kpis').then(r => r.json()),
        fetch(`/api/status${q}`).then(r => r.json()),
        fetch(`/api/components${q}&limit=8`).then(r => r.json()),
        fetch(`/api/branches${q}&limit=12`).then(r => r.json()),
        fetch(`/api/trends${q}`).then(r => r.json()),
        fetch('/api/pcb-list').then(r => r.json()),
      ])

      if (kpiR.status === 'fulfilled' && !kpiR.value?.error) setKpis(kpiR.value)
      else setError('Database error — check .env.local settings')
      if (stR.status === 'fulfilled' && Array.isArray(stR.value)) setStatusData(stR.value)
      if (cmpR.status === 'fulfilled' && Array.isArray(cmpR.value)) setComponentData(cmpR.value)
      if (brR.status === 'fulfilled' && Array.isArray(brR.value)) setBranchData(brR.value)
      if (trR.status === 'fulfilled' && Array.isArray(trR.value)) setTrendsData(trR.value)
      if (pcbR.status === 'fulfilled' && Array.isArray(pcbR.value)) {
        setTableData(pcbR.value)
        if (pcbR.value.length === 0) setNoData(true)
      }
    } catch { setError('API unreachable — ensure npm run dev is running') }
    finally { setLoading(false) }
  }, [filters.part_code, filters.status])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleFC = f => setFilters(p => ({ ...p, ...f }))
  const handleReset = () => setFilters({ status: 'all', part_code: 'all', search: '' })

  return (
    <>
      <Head><title>Dashboard — Electrolyte Bajaj</title></Head>
      <Layout onRefresh={fetchAll}>
        <Box sx={{ maxWidth: '100%' }}>

          {/* Page header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2.5}>
            <Box>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#eaf3ff', letterSpacing: '-0.5px', mb: 0.2 }}>PCB Data Overview</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'rgba(120,160,210,0.45)' }}>
                {kpis ? `${kpis.total_entries?.toLocaleString()} records · ${kpis.total_pcbs} PCB types · ${kpis.total_branches} locations` : loading ? 'Loading...' : 'Upload Excel to get started'}
              </Typography>
            </Box>
            {kpis?.last_upload && (
              <Chip label={`Updated ${new Date(kpis.last_upload.uploaded_at).toLocaleDateString('en-IN')}`} size="small"
                sx={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.15)', color: '#00e87a', fontSize: '0.6rem', height: 22 }} />
            )}
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px', background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.18)', color: '#ff4d4d', fontSize: '0.8rem', '& .MuiAlert-icon': { color: '#ff4d4d' } }}>{error}</Alert>}

          {noData && !loading && !error && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: '12px', background: 'rgba(0,180,255,0.06)', border: '1px solid rgba(0,180,255,0.15)', color: '#00b4ff', fontSize: '0.8rem' }}
              action={<Button size="small" onClick={() => router.push('/upload')} startIcon={<UploadFileIcon sx={{ fontSize: 13 }} />} sx={{ color: '#00b4ff', border: '1px solid rgba(0,180,255,0.3)', borderRadius: '8px', fontSize: '0.7rem' }}>Upload</Button>}>
              No data found. Upload your Bajaj PCB Excel file.
            </Alert>
          )}

          {/* KPI Cards */}
          <KPICards data={kpis} loading={loading} />

          {/* Smart Insights */}
          <InsightsPanel />

          {/* Filters */}
          <FilterBar filters={filters} onFilterChange={handleFC} onReset={handleReset} pcbList={tableData} />

          {/* CHARTS ROW 1 — Trends (full width) */}
          <Box sx={{ mb: 2 }}>
            <ChartCard
              title="Monthly Repair Trends"
              sub="PCB repair volume by month — OK repaired vs NFF no-fault-found"
              loading={loading} h={220}>
              {trendsData.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height={220} flexDirection="column" gap={1}>
                  <Typography sx={{ fontSize: '1.4rem', opacity: 0.2 }}>📈</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: 'rgba(120,160,210,0.25)' }}>Repair trend data will appear after upload</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gOK" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00e87a" stopOpacity={0.2} /><stop offset="95%" stopColor="#00e87a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gNFF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff9500" stopOpacity={0.2} /><stop offset="95%" stopColor="#ff9500" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: 'rgba(160,200,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(120,160,210,0.4)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                    <Tooltip {...TT}
                      formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]}
                      labelStyle={{ color: 'rgba(160,200,255,0.6)', fontWeight: 600, marginBottom: 4 }}
                    />
                    <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 11 }} />
                    <Area type="monotone" dataKey="ok_count" name="OK" stroke="#00e87a" strokeWidth={2.5} fill="url(#gOK)" dot={{ fill: '#00e87a', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#00e87a' }} animationDuration={1000} />
                    <Area type="monotone" dataKey="nff_count" name="NFF" stroke="#ff9500" strokeWidth={2.5} fill="url(#gNFF)" dot={{ fill: '#ff9500', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#ff9500' }} animationDuration={1100} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </Box>

          {/* CHARTS ROW 2 — Status + Components + Branches */}
          <Grid container spacing={2} mb={2}>

            {/* Status Donut */}
            <Grid item xs={12} md={3}>
              <ChartCard title="Status Split" sub="OK vs NFF overall" loading={loading} h={240}>
                {statusData.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height={240} flexDirection="column" gap={1}>
                    <Typography sx={{ fontSize: '1.2rem', opacity: 0.2 }}>📊</Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: 'rgba(120,160,210,0.25)' }}>No data</Typography>
                  </Box>
                ) : (
                  <Box>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={48} outerRadius={78} paddingAngle={3} dataKey="count" nameKey="status" labelLine={false} label={renderPieLabel} animationBegin={0} animationDuration={900}>
                          {statusData.map((e, i) => <Cell key={i} fill={e.status==='OK'?'#00e87a':'#ff9500'} />)}
                        </Pie>
                        <Tooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box display="flex" gap={1} justifyContent="center">
                      {statusData.map((s, i) => (
                        <Box key={i} sx={{ textAlign: 'center', px: 1.2, py: 0.6, borderRadius: '8px', background: s.status==='OK'?'rgba(0,232,122,0.08)':'rgba(255,149,0,0.08)', border: `1px solid ${s.status==='OK'?'rgba(0,232,122,0.18)':'rgba(255,149,0,0.18)'}` }}>
                          <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: s.status==='OK'?'#00e87a':'#ff9500', fontFamily: "'DM Mono',monospace", lineHeight: 1.2 }}>{Number(s.count).toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: 'rgba(160,200,255,0.45)', fontWeight: 600 }}>{s.status} · {s.percentage}%</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </ChartCard>
            </Grid>

            {/* Top Components */}
            <Grid item xs={12} md={4}>
              <ChartCard title="Top Components" sub="Most consumed in repairs" loading={loading} h={240}>
                {componentData.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height={240}>
                    <Typography sx={{ fontSize: '0.68rem', color: 'rgba(120,160,210,0.25)' }}>No data</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={componentData} layout="vertical" barSize={12} margin={{ left: 6, right: 18, top: 2, bottom: 2 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'rgba(160,200,255,0.5)', fontSize: 9, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="component" type="category" tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 9 }} axisLine={false} tickLine={false} width={48} />
                      <Tooltip {...TT} formatter={(v) => [<span style={{ color: '#00b4ff', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, 'Count']} />
                      <Bar dataKey="total_count" radius={[0, 3, 3, 0]} animationDuration={800}>
                        {componentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Grid>

            {/* Top Branches */}
            <Grid item xs={12} md={5}>
              <ChartCard title="Top Branches" sub="Service locations — OK vs NFF" loading={loading} h={240}>
                {branchData.length === 0 ? (
                  <Box display="flex" alignItems="center" justifyContent="center" height={240}>
                    <Typography sx={{ fontSize: '0.68rem', color: 'rgba(120,160,210,0.25)' }}>No data</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={branchData.slice(0, 8)} barSize={16} margin={{ top: 5, right: 18, left: 0, bottom: 55 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="branch" tick={{ fill: 'rgba(160,200,255,0.5)', fontSize: 9 }} axisLine={false} tickLine={false} angle={-35} textAnchor="end" interval={0} />
                      <YAxis tick={{ fill: 'rgba(120,160,210,0.4)', fontSize: 9, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                      <Tooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                      <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 10 }} />
                      <Bar dataKey="ok_count" name="OK" stackId="a" fill="#00e87a" animationDuration={800} />
                      <Bar dataKey="nff_count" name="NFF" stackId="a" fill="#ff9500" radius={[3, 3, 0, 0]} animationDuration={900} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </Grid>
          </Grid>

          {/* Master Table */}
          <DataTable rows={tableData} search={filters.search} onSearchChange={v => handleFC({ search: v })} loading={loading} />
        </Box>
      </Layout>
    </>
  )
}
