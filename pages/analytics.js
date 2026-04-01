import { useEffect, useState } from 'react'
import Head from 'next/head'
import { Alert, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import Layout from '../components/common/Layout'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const PANEL_BORDER = '1px solid rgba(148, 163, 184, 0.14)'
const CARD_BG = 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)'
const COLORS = ['#38bdf8', '#22c55e', '#f59e0b', '#a78bfa', '#f97316', '#ef4444']
const tooltipStyle = {
  contentStyle: {
    background: '#f8fafc',
    border: '1px solid rgba(15, 23, 42, 0.16)',
    borderRadius: 14,
    color: '#0f172a',
    boxShadow: '0 18px 40px rgba(2, 8, 23, 0.22)',
  },
  labelStyle: { color: '#334155', fontWeight: 700 },
}

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN')

function Card({ title, subtitle, children, minHeight = 320, actionLabel, onAction }) {
  return (
    <Box sx={{ p: 2.5, minHeight, height: '100%', borderRadius: 4, background: CARD_BG, border: PANEL_BORDER }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
        <Box>
          <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.4 }}>{subtitle}</Typography>
        </Box>
        {actionLabel ? (
          <Button onClick={onAction} sx={{ color: '#cbd5e1', border: PANEL_BORDER, borderRadius: 999, textTransform: 'none', fontSize: '0.72rem', px: 1.3 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Box>
      {children}
    </Box>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [partCode, setPartCode] = useState('all')
  const [status, setStatus] = useState('all')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (partCode !== 'all') params.set('part_code', partCode)
      if (status !== 'all') params.set('status', status)
      const response = await fetch(`/api/dashboard-overview?${params.toString()}`)
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to load analytics')
      setData(payload)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [partCode, status])

  const statusData = (data?.status || []).map((item) => ({ ...item, value: Number(item.value || 0) }))
  const trendData = data?.trends || []
  const componentData = data?.components || []
  const branchData = data?.topCities || []
  const pcbData = data?.topPartCodes || []

  return (
    <>
      <Head><title>Analytics - Electrolyte Bajaj</title></Head>
      <Layout onRefresh={loadData}>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', mb: 0.3 }}>Analytics & Insights</Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94a3b8' }}>Faster analytics view powered by a single overview API call and fixed chart boundaries.</Typography>
            </Box>
            <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>PCB Code</InputLabel>
                <Select value={partCode} label="PCB Code" onChange={(event) => setPartCode(event.target.value)} sx={{ color: '#e2e8f0', borderRadius: 2.5, background: 'rgba(15, 23, 42, 0.92)', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.18)' } }}>
                  <MenuItem value="all">All PCBs</MenuItem>
                  {(data?.filters?.partCodes || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel sx={{ color: '#94a3b8', fontSize: '0.78rem' }}>Status</InputLabel>
                <Select value={status} label="Status" onChange={(event) => setStatus(event.target.value)} sx={{ color: '#e2e8f0', borderRadius: 2.5, background: 'rgba(15, 23, 42, 0.92)', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.18)' } }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="OK">OK</MenuItem>
                  <MenuItem value="NFF">NFF</MenuItem>
                </Select>
              </FormControl>
              <Button onClick={() => router.push('/dashboard')} sx={{ color: '#f8fafc', background: 'rgba(56, 189, 248, 0.16)', border: '1px solid rgba(56, 189, 248, 0.26)', borderRadius: 999, textTransform: 'none', px: 1.5, '&:hover': { background: 'rgba(56, 189, 248, 0.24)' } }}>Open dashboard</Button>
              {partCode !== 'all' ? <Button onClick={() => router.push(`/master-table/${partCode}`)} sx={{ color: '#f8fafc', background: 'rgba(34, 197, 94, 0.16)', border: '1px solid rgba(34, 197, 94, 0.24)', borderRadius: 999, textTransform: 'none', px: 1.5, '&:hover': { background: 'rgba(34, 197, 94, 0.24)' } }}>Open part code</Button> : null}
            </Stack>
          </Box>

          {error ? <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>{error}</Alert> : null}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card title="Monthly Repair Trends" subtitle="Linear chart keeps all lines inside the card without overshooting." actionLabel="Open dashboard" onAction={() => router.push('/dashboard')} minHeight={330}>
                <Box sx={{ height: 250, overflow: 'hidden' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 6 }}>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
                      <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Records']} />
                      <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                      <Line type="linear" dataKey="total" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 2 }} name="Total" />
                      <Line type="linear" dataKey="ok_count" stroke="#22c55e" strokeWidth={2.8} dot={{ r: 3 }} name="OK" />
                      <Line type="linear" dataKey="nff_count" stroke="#f59e0b" strokeWidth={2.8} dot={{ r: 3 }} name="NFF" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card title="Overall Status" subtitle="OK vs NFF pie chart with visible center radius and parsed values." minHeight={360}>
                <Box sx={{ height: 245 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={4}>
                        {statusData.map((item, index) => <Cell key={item.name} fill={index === 0 ? '#22c55e' : '#f59e0b'} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Records']} />
                      <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: 14 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack direction="row" spacing={1} justifyContent="center" useFlexGap flexWrap="wrap">
                  {statusData.map((item) => (
                    <Box key={item.name} sx={{ px: 1.4, py: 0.8, borderRadius: 2.5, background: item.name === 'OK' ? 'rgba(34, 197, 94, 0.10)' : 'rgba(245, 158, 11, 0.10)', border: item.name === 'OK' ? '1px solid rgba(34, 197, 94, 0.18)' : '1px solid rgba(245, 158, 11, 0.18)' }}>
                      <Typography sx={{ color: item.name === 'OK' ? '#22c55e' : '#f59e0b', fontWeight: 700, fontSize: '0.96rem', textAlign: 'center' }}>{formatNumber(item.value)}</Typography>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', mt: 0.25 }}>{item.name}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Card title="PCB Type Comparison" subtitle="Clickable bars open the selected part code detail page." minHeight={360}>
                <Box sx={{ height: 275 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pcbData} barSize={26} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                      <XAxis dataKey="partCode" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} width={34} />
                      <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Records']} />
                      <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                      <Bar dataKey="ok" name="OK" stackId="a" fill="#22c55e" onClick={(entry) => router.push(`/master-table/${entry.partCode}`)} />
                      <Bar dataKey="nff" name="NFF" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} onClick={(entry) => router.push(`/master-table/${entry.partCode}`)} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card title="Top Components Consumed" subtitle="Fast horizontal bars with no extra API round trips." minHeight={380}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={componentData} layout="vertical" margin={{ top: 5, right: 10, left: 36, bottom: 5 }}>
                      <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="component" type="category" width={110} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Usage']} />
                      <Bar dataKey="total_count" radius={[0, 8, 8, 0]}>
                        {componentData.map((item, index) => <Cell key={item.component} fill={COLORS[index % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card title="Top Service Branches" subtitle="City bars open the map analytics drill-down page." minHeight={380} actionLabel="Open map" onAction={() => router.push('/map-analytics')}>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchData.map((item) => ({ ...item, branch: item.city || item.branch }))} layout="vertical" margin={{ top: 5, right: 10, left: 36, bottom: 5 }}>
                      <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="branch" type="category" width={110} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'PCBs']} />
                      <Bar dataKey="total" fill="#38bdf8" radius={[0, 8, 8, 0]} onClick={() => router.push('/map-analytics')} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  )
}
