import { useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined'
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined'
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
const STATUS_COLORS = { OK: '#22c55e', NFF: '#f59e0b', WIP: '#a78bfa' }
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

function SectionCard({ title, subtitle, actionLabel, onAction, children, minHeight = 320 }) {
  return (
    <Box sx={{ p: 2.5, minHeight, height: '100%', borderRadius: 4, background: CARD_BG, border: PANEL_BORDER, boxShadow: '0 18px 45px rgba(2, 8, 23, 0.22)' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2.2}>
        <Box>
          <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>{title}</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.78rem', mt: 0.4 }}>{subtitle}</Typography>
        </Box>
        {actionLabel ? (
          <Button onClick={onAction} sx={{ color: '#cbd5e1', border: PANEL_BORDER, borderRadius: 999, textTransform: 'none', fontSize: '0.72rem', px: 1.4, py: 0.55 }}>
            {actionLabel}
          </Button>
        ) : null}
      </Box>
      {children}
    </Box>
  )
}

function DataQualityCard({ quality }) {
  if (!quality) return null
  return (
    <Box sx={{ p: 2.2, borderRadius: 4, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)', border: PANEL_BORDER }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1.5}>
        <Box>
          <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.96rem' }}>Data Quality</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.35 }}>Latest upload learning summary</Typography>
        </Box>
        <Chip label={quality.originalName || 'Last upload'} size="small" sx={{ background: 'rgba(56, 189, 248, 0.12)', color: '#bae6fd', maxWidth: 220 }} />
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
        {[
          { label: 'Auto-fixed', value: formatNumber(quality.autoFixed), color: '#22c55e' },
          { label: 'Flagged', value: formatNumber(quality.flagged), color: '#f59e0b' },
          { label: 'Uploaded', value: quality.uploadedAt ? new Date(quality.uploadedAt).toLocaleDateString('en-IN') : 'No data', color: '#38bdf8' },
        ].map((item) => (
          <Box key={item.label} sx={{ minWidth: 140, flex: '1 1 0', p: 1.3, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.62)' }}>
            <Typography sx={{ color: item.color, fontWeight: 800, fontSize: '1rem' }}>{item.value}</Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', mt: 0.35 }}>{item.label}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}

function TransparencyCard({ transparency }) {
  if (!transparency) return null

  const metrics = [
    { label: 'Total Uploaded', value: transparency.uploadedTotal, color: '#38bdf8' },
    { label: 'Analytics Records', value: transparency.analyticsTotal, color: '#22c55e' },
    { label: 'Geo-Mapped', value: transparency.mappedTotal, color: '#a78bfa' },
    { label: 'Unmapped', value: transparency.unmappedTotal, color: '#f59e0b' },
  ]

  return (
    <Box sx={{ p: 2.2, borderRadius: 4, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)', border: PANEL_BORDER }}>
      <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.96rem' }}>Data Transparency</Typography>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.35, mb: 1.5 }}>
        Uploaded totals stay separate from cleaned analytics records and geo-mapped records.
      </Typography>
      <Grid container spacing={1.2}>
        {metrics.map((item) => (
          <Grid item xs={6} md={3} key={item.label}>
            <Box sx={{ p: 1.3, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.62)' }}>
              <Typography sx={{ color: item.color, fontWeight: 800, fontSize: '1rem' }}>{formatNumber(item.value)}</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem', mt: 0.35 }}>{item.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.4 }}>
        <Chip label={`${transparency.mappedCoverage || 0}% map coverage`} sx={{ background: 'rgba(56, 189, 248, 0.12)', color: '#bae6fd' }} />
        <Chip label={`${formatNumber(transparency.ignoredTotal)} ignored / rejected`} sx={{ background: 'rgba(245, 158, 11, 0.12)', color: '#fde68a' }} />
      </Stack>
    </Box>
  )
}

function HealthCard({ health }) {
  if (!health) return null

  const toneColor = health.tone === 'healthy' ? '#22c55e' : health.tone === 'watch' ? '#f59e0b' : '#ef4444'

  return (
    <Box sx={{ p: 2.2, borderRadius: 4, background: 'linear-gradient(180deg, rgba(13,20,34,0.96) 0%, rgba(9,14,25,0.96) 100%)', border: PANEL_BORDER }}>
      <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.96rem' }}>Data Health</Typography>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.35, mb: 1.4 }}>Score is based on WIP load, geo coverage, and flagged upload values.</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Typography sx={{ color: toneColor, fontWeight: 800, fontSize: '1.7rem' }}>{health.score}</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>Confidence score</Typography>
        </Box>
        <Stack spacing={0.5} sx={{ minWidth: 180 }}>
          <Typography sx={{ color: '#cbd5e1', fontSize: '0.76rem' }}>WIP: {health.wipPct}%</Typography>
          <Typography sx={{ color: '#cbd5e1', fontSize: '0.76rem' }}>Mapped: {health.mappedPct}%</Typography>
          <Typography sx={{ color: '#cbd5e1', fontSize: '0.76rem' }}>Flagged: {health.flaggedPct}%</Typography>
        </Stack>
      </Box>
      <Typography sx={{ color: toneColor, fontSize: '0.78rem', fontWeight: 600, mt: 1.4 }}>{health.message}</Typography>
    </Box>
  )
}

function InsightsCard({ insights }) {
  if (!insights?.length) return null
  return (
    <SectionCard title="Auto Insights" subtitle="Patterns derived automatically from current analytics and mapped geography." minHeight={260}>
      <Stack spacing={1.05}>
        {insights.map((item) => (
          <Box key={item.label} sx={{ p: 1.3, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.58)' }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.6 }}>{item.label}</Typography>
            <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', mt: 0.55 }}>{item.value}</Typography>
            <Typography sx={{ color: '#cbd5e1', fontSize: '0.74rem', mt: 0.5 }}>{item.detail}</Typography>
          </Box>
        ))}
      </Stack>
    </SectionCard>
  )
}

function KpiCard({ title, value, subtitle, accent, icon: Icon, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2.2,
        borderRadius: 4,
        background: CARD_BG,
        border: PANEL_BORDER,
        cursor: 'pointer',
        height: '100%',
        transition: 'transform 0.18s ease, border-color 0.18s ease',
        '&:hover': { transform: 'translateY(-3px)', borderColor: `${accent}55` },
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8}>
        <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 3, color: accent, background: `${accent}18` }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
        <Chip label="Drill down" size="small" sx={{ background: 'rgba(56, 189, 248, 0.12)', color: '#bae6fd', height: 22 }} />
      </Box>
      <Typography sx={{ color: '#f8fafc', fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ color: '#cbd5e1', fontSize: '0.9rem', mt: 0.9 }}>{title}</Typography>
      <Typography sx={{ color: '#94a3b8', fontSize: '0.75rem', mt: 0.6 }}>{subtitle}</Typography>
    </Box>
  )
}

function DetailCard({ detail, loading, onOpenState, onOpenCity, onOpenPartCode, onReset, onOpenAnalytics, onOpenTable }) {
  const level = detail?.level || 'dashboard'
  return (
    <SectionCard title={detail?.title || 'Drill-down analytics'} subtitle="Dashboard to part code to component consumption" minHeight={760}>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Button onClick={onReset} sx={{ borderRadius: 999, border: PANEL_BORDER, color: '#cbd5e1', textTransform: 'none' }}>Dashboard</Button>
        {detail?.state ? <Button onClick={() => onOpenState(detail.state)} sx={{ borderRadius: 999, border: PANEL_BORDER, color: '#cbd5e1', textTransform: 'none' }}>{detail.state}</Button> : null}
        {detail?.city ? <Button onClick={() => onOpenCity(detail.city)} sx={{ borderRadius: 999, border: PANEL_BORDER, color: '#cbd5e1', textTransform: 'none' }}>{detail.city}</Button> : null}
      </Stack>

      {loading ? <LinearProgress sx={{ mb: 2, borderRadius: 999 }} /> : null}

      {detail?.summary ? (
        <Grid container spacing={1.2} sx={{ mb: 2 }}>
          {[ 
            { label: 'Total', value: formatNumber(detail.summary.total), color: '#f8fafc' },
            { label: 'OK', value: formatNumber(detail.summary.ok), color: '#22c55e' },
            { label: 'NFF', value: formatNumber(detail.summary.nff), color: '#f59e0b' },
            { label: 'WIP', value: formatNumber(detail.summary.wip), color: '#a78bfa' },
            { label: 'OK Rate', value: `${detail.summary.okRate || 0}%`, color: '#38bdf8' },
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

      {level === 'dashboard' ? (
        <Stack spacing={1.1}>
          {(detail?.items || []).map((item) => (
            <Box key={item.partCode} onClick={() => onOpenPartCode(item.partCode)} sx={{ p: 1.35, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.58)', cursor: 'pointer', '&:hover': { borderColor: 'rgba(56, 189, 248, 0.28)' } }}>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Box>
                  <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.86rem' }}>Part Code {item.partCode}</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.4 }}>{item.productDescription || 'PCB'}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Total: {formatNumber(item.total)}</Typography>
                  <Typography sx={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>OK: {formatNumber(item.ok)}</Typography>
                  <Typography sx={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>NFF: {formatNumber(item.nff)}</Typography>
                  <Typography sx={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>WIP: {formatNumber(item.wip)}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : null}

      {level === 'state' ? (
        <Stack spacing={1.1}>
          {(detail?.items || []).map((item) => (
            <Box key={item.city} onClick={() => onOpenCity(item.city)} sx={{ p: 1.35, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.58)', cursor: 'pointer', '&:hover': { borderColor: 'rgba(56, 189, 248, 0.28)' } }}>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Box>
                  <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.86rem' }}>{item.city}</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.4 }}>City-wise PCB counts</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Total: {formatNumber(item.total)}</Typography>
                  <Typography sx={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>OK: {formatNumber(item.ok)}</Typography>
                  <Typography sx={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>NFF: {formatNumber(item.nff)}</Typography>
                  <Typography sx={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>WIP: {formatNumber(item.wip)}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : null}

      {level === 'city' ? (
        <Stack spacing={1.1}>
          {(detail?.items || []).map((item) => (
            <Box key={item.partCode} onClick={() => onOpenPartCode(item.partCode)} sx={{ p: 1.35, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.58)', cursor: 'pointer', '&:hover': { borderColor: 'rgba(56, 189, 248, 0.28)' } }}>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <Box>
                  <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.86rem' }}>Part Code {item.partCode}</Typography>
                  <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.4 }}>{item.productDescription || 'PCB'}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ color: '#f8fafc', fontSize: '0.75rem', fontWeight: 600 }}>Total: {formatNumber(item.total)}</Typography>
                  <Typography sx={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600 }}>OK: {formatNumber(item.ok)}</Typography>
                  <Typography sx={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>NFF: {formatNumber(item.nff)}</Typography>
                  <Typography sx={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600 }}>WIP: {formatNumber(item.wip)}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      ) : null}

      {level === 'part-code' ? (
        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.4 }}>
            <Button onClick={onOpenAnalytics} sx={{ color: '#cbd5e1', border: PANEL_BORDER, borderRadius: 999, textTransform: 'none', px: 1.4 }}>Open analytics</Button>
            <Button onClick={onOpenTable} sx={{ color: '#cbd5e1', border: PANEL_BORDER, borderRadius: 999, textTransform: 'none', px: 1.4 }}>Open part detail</Button>
          </Stack>
          <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem', mb: 0.4 }}>Component Consumption</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mb: 1.8 }}>This is the largest section and stays inside its card to avoid overflow.</Typography>
                <Box sx={{ height: 300, mb: 2.2 }}>
                  <ResponsiveContainer width="100%" height="100%">
              <BarChart data={detail?.detail?.components || []} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="component" type="category" width={150} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Usage']} />
                <Bar dataKey="total_count" fill="#38bdf8" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.14)', mb: 2 }} />
          <Stack spacing={1}>
            {(detail?.detail?.samples || []).map((item, index) => (
              <Box key={`${item.branch}-${index}`} sx={{ p: 1.3, borderRadius: 3, border: PANEL_BORDER, background: 'rgba(15, 23, 42, 0.58)' }}>
                <Typography sx={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.82rem' }}>{item.branch} - {item.status}</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.74rem', mt: 0.55 }}>{item.analysis}</Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : null}
    </SectionCard>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [overview, setOverview] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: 'all', part_code: 'all' })

  const loadOverview = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.part_code !== 'all') params.set('part_code', filters.part_code)
      const response = await fetch(`/api/dashboard-overview?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to load dashboard')
      setOverview(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const openDetail = async (next) => {
    setDetailLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('level', next.level)
      if (next.state) params.set('state', next.state)
      if (next.city) params.set('city', next.city)
      if (next.partCode) params.set('part_code', next.partCode)
      if (next.status) params.set('status', next.status)
      const response = await fetch(`/api/drilldown?${params.toString()}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to load details')
      setDetail({ ...data, state: next.state || data.summary?.state, city: next.city || data.summary?.city })
    } catch (err) {
      setDetail({ title: 'Drill-down unavailable', level: next.level, items: [], error: err.message })
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => { loadOverview() }, [filters.status, filters.part_code])
  useEffect(() => { openDetail({ level: 'dashboard' }) }, [overview])

  const openState = (state) => state && openDetail({ level: 'state', state })
  const openCity = (city) => city && openDetail({ level: 'city', state: detail?.state || overview?.kpis?.topState, city })
  const openPartCode = (partCode) => {
    if (!partCode) return
    if (!detail?.city) {
      openDetail({ level: 'part-code', partCode })
      return
    }
    openDetail({ level: 'part-code', state: detail?.state || overview?.kpis?.topState, city: detail?.city, partCode })
  }

  const trendData = overview?.trends || []

  return (
    <>
      <Head><title>Dashboard - Electrolyte Bajaj</title></Head>
      <Layout onRefresh={loadOverview}>
        <Box>
          <Box sx={{ p: { xs: 2.2, md: 3 }, borderRadius: 5, background: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 30%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.14), transparent 24%), linear-gradient(180deg, #0f172a 0%, #08111f 100%)', border: PANEL_BORDER, mb: 2.5 }}>
            <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography sx={{ color: '#f8fafc', fontSize: { xs: '1.35rem', md: '1.8rem' }, fontWeight: 800 }}>PCB Analytics Dashboard</Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '0.88rem', mt: 0.7, maxWidth: 760 }}>Clean enterprise layout with fixed chart regions, readable drill-down cards, and monthly trends kept inside their chart container.</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Select size="small" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ minWidth: 140, color: '#e2e8f0', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.18)' } }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="OK">OK</MenuItem>
                  <MenuItem value="NFF">NFF</MenuItem>
                  <MenuItem value="WIP">WIP</MenuItem>
                </Select>
                <Select size="small" value={filters.part_code} onChange={(event) => setFilters((current) => ({ ...current, part_code: event.target.value }))} sx={{ minWidth: 160, color: '#e2e8f0', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.18)' } }}>
                  <MenuItem value="all">All Part Codes</MenuItem>
                  {(overview?.filters?.partCodes || []).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
                <Button onClick={() => setFilters({ status: 'all', part_code: 'all' })} sx={{ borderRadius: 999, color: '#cbd5e1', border: PANEL_BORDER, textTransform: 'none', px: 1.8 }}>Reset</Button>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
              <Chip label={`${formatNumber(overview?.transparency?.uploadedTotal || overview?.kpis?.totalEntries)} uploaded`} sx={{ background: 'rgba(56, 189, 248, 0.12)', color: '#bae6fd' }} />
              <Chip label={`${formatNumber(overview?.transparency?.mappedTotal)} geo-mapped`} sx={{ background: 'rgba(167, 139, 250, 0.14)', color: '#ddd6fe' }} />
              <Chip label={`${formatNumber(overview?.kpis?.totalCities)} mapped cities`} sx={{ background: 'rgba(34, 197, 94, 0.12)', color: '#bbf7d0' }} />
            </Stack>
          </Box>

          {error ? <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>{error}</Alert> : null}
          {loading ? <LinearProgress sx={{ mb: 2.5, borderRadius: 999 }} /> : null}
          {(overview?.alerts || []).length ? (
            <Stack spacing={1.2} sx={{ mb: 2.5 }}>
              {overview.alerts.map((item) => (
                <Alert key={`${item.title}-${item.description}`} severity={item.severity || 'info'} sx={{ borderRadius: 3 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem' }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: '0.76rem', mt: 0.35 }}>{item.description}</Typography>
                </Alert>
              ))}
            </Stack>
          ) : null}

          <Grid container spacing={2}>
            <Grid item xs={12} xl={8}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TransparencyCard transparency={overview?.transparency} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DataQualityCard quality={overview?.dataQuality} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <HealthCard health={overview?.health} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard title="Unique Part Codes" value={formatNumber(overview?.kpis?.uniquePartCodes)} subtitle={`${formatNumber(overview?.kpis?.totalEntries)} analytics records`} accent="#38bdf8" icon={MemoryOutlinedIcon} onClick={() => openDetail({ level: 'dashboard' })} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard title="OK Count" value={formatNumber(overview?.kpis?.okCount)} subtitle="Inspect OK-heavy part codes" accent="#22c55e" icon={TaskAltOutlinedIcon} onClick={() => openDetail({ level: 'dashboard', status: 'OK' })} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard title="NFF Count" value={formatNumber(overview?.kpis?.nffCount)} subtitle="Inspect NFF-heavy part codes" accent="#f59e0b" icon={ReportProblemOutlinedIcon} onClick={() => openDetail({ level: 'dashboard', status: 'NFF' })} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard title="WIP Count" value={formatNumber(overview?.kpis?.wipCount)} subtitle="Track pending or empty-status records" accent="#a78bfa" icon={HourglassBottomOutlinedIcon} onClick={() => openDetail({ level: 'dashboard', status: 'WIP' })} />
                </Grid>
                <Grid item xs={12} sm={6} lg={3}>
                  <KpiCard title="Top State / City" value={overview?.kpis?.topState || 'No data'} subtitle={overview?.kpis?.topCity || 'No data'} accent="#a78bfa" icon={FmdGoodOutlinedIcon} onClick={() => openState(overview?.kpis?.topState)} />
                </Grid>
                <Grid item xs={12}>
                  <InsightsCard insights={overview?.insights} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard title="Status Split" subtitle="Donut chart sized to stay fully visible for OK, NFF, and WIP." actionLabel="Open part codes" onAction={() => router.push(filters.part_code !== 'all' ? `/master-table/${filters.part_code}` : '/analytics')}>
                    <Box sx={{ height: 290 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={overview?.status || []} dataKey="value" nameKey="name" innerRadius={72} outerRadius={108} paddingAngle={4}>
                            {(overview?.status || []).map((entry) => <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#38bdf8'} />)}
                          </Pie>
                          <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Records']} />
                          <Legend wrapperStyle={{ color: '#cbd5e1', paddingTop: 16 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard title="Monthly Repair Trend" subtitle="The chart is locked to its own card region and no longer drifts outside." actionLabel="Inspect detail" onAction={() => router.push(filters.part_code !== 'all' ? `/master-table/${filters.part_code}` : '/analytics')}>
                    <Box sx={{ height: 290, overflow: 'hidden' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 10, right: 12, left: 0, bottom: 8 }}>
                          <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={34} />
                          <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Records']} />
                          <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                          <Line type="linear" dataKey="ok_count" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} name="OK" />
                          <Line type="linear" dataKey="nff_count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 3 }} name="NFF" />
                          <Line type="linear" dataKey="wip_count" stroke="#a78bfa" strokeWidth={3} dot={{ r: 3 }} name="WIP" />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard title="Component Consumption" subtitle="Horizontal bars match enterprise-style readability." actionLabel={filters.part_code !== 'all' ? 'Open part detail' : 'Open part list'} onAction={() => router.push(filters.part_code !== 'all' ? `/master-table/${filters.part_code}` : '/master-table')}>
                    <Box sx={{ height: 310 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={overview?.components || []} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="component" type="category" width={150} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'Usage']} />
                          <Bar dataKey="total_count" radius={[0, 8, 8, 0]}>{(overview?.components || []).map((item, index) => <Cell key={item.component} fill={COLORS[index % COLORS.length]} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <SectionCard title="Top States / Cities" subtitle="Stacked into a clean two-chart block like enterprise dashboards." actionLabel="Open state detail" onAction={() => openState(overview?.kpis?.topState)}>
                    <Box sx={{ height: 145, mb: 2 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={(overview?.topStates || []).map((item) => ({ name: item.state, total: item.total }))} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'PCBs']} />
                          <Bar dataKey="total" fill="#38bdf8" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.12)', mb: 2 }} />
                    <Box sx={{ height: 145 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={(overview?.topCities || []).map((item) => ({ name: item.city, total: item.total }))} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
                          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" width={110} tick={{ fill: '#e2e8f0', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip {...tooltipStyle} formatter={(value) => [formatNumber(value), 'PCBs']} />
                          <Bar dataKey="total" fill="#a78bfa" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </SectionCard>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} xl={4}>
              <DetailCard
                detail={detail}
                loading={detailLoading}
                onOpenState={openState}
                onOpenCity={openCity}
                onOpenPartCode={openPartCode}
                onReset={() => openDetail({ level: 'dashboard' })}
                onOpenAnalytics={() => router.push('/analytics')}
                onOpenTable={() => detail?.summary?.partCode && router.push(`/master-table/${detail.summary.partCode}`)}
              />
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  )
}
