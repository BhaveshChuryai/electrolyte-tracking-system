import { Grid, Box, Typography, Skeleton } from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import MemoryIcon from '@mui/icons-material/Memory'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined'

function useCounter(target, dur = 1200) {
  const [n, setN] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (!target || target === 0) { setN(0); return }
    clearInterval(ref.current)
    let cur = 0
    const step = target / (dur / 16)
    ref.current = setInterval(() => {
      cur += step
      if (cur >= target) { setN(target); clearInterval(ref.current) }
      else setN(Math.floor(cur))
    }, 16)
    return () => clearInterval(ref.current)
  }, [target, dur])
  return n
}

function KPICard({ title, value, sub, icon: Icon, color, glow, suffix = '', isFloat, delay = 0 }) {
  const num = typeof value === 'number' ? value : 0
  const animated = useCounter(isFloat ? Math.round(num * 10) : num)
  const display = isFloat ? `${(animated / 10).toFixed(1)}${suffix}` : `${animated.toLocaleString()}${suffix}`

  return (
    <Box sx={{
      p: 2.2, borderRadius: '14px',
      background: 'linear-gradient(145deg, #0d1626, #0f1e38)',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: `0 4px 24px ${glow}`,
      transition: 'all 0.25s ease', height: '100%', cursor: 'default',
      animation: `fadeUp 0.5s ease ${delay}s both`,
      '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 32px ${glow}`, border: `1px solid ${color}30` }
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.8}>
        <Box sx={{ p: 0.9, borderRadius: '9px', background: `${color}14`, color, display: 'inline-flex', border: `1px solid ${color}22` }}>
          <Icon sx={{ fontSize: 19 }} />
        </Box>
        <Box sx={{ px: 0.8, py: 0.2, borderRadius: '5px', background: 'rgba(0,232,122,0.07)', border: '1px solid rgba(0,232,122,0.14)' }}>
          <Typography sx={{ fontSize: '0.56rem', fontWeight: 700, color: '#00e87a', letterSpacing: '0.5px' }}>● LIVE</Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#eaf3ff', letterSpacing: '-1px', lineHeight: 1, mb: 0.4, fontFamily: "'DM Mono', monospace" }}>
        {display}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(160,200,255,0.45)', mb: 0.9 }}>{title}</Typography>
      <Box sx={{ height: 1, background: 'rgba(255,255,255,0.05)', mb: 0.9 }} />
      <Typography sx={{ fontSize: '0.63rem', color, lineHeight: 1.4 }}>{sub}</Typography>
    </Box>
  )
}

function KPISkeleton() {
  return (
    <Box sx={{ p: 2.2, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" mb={1.8}>
        <Skeleton variant="rounded" width={36} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '9px' }} />
        <Skeleton variant="rounded" width={46} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.04)' }} />
      </Box>
      <Skeleton variant="text" width="55%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.4 }} />
      <Skeleton variant="text" width="80%" height={18} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 0.9 }} />
      <Skeleton variant="text" width="70%" height={14} sx={{ bgcolor: 'rgba(255,255,255,0.03)' }} />
    </Box>
  )
}

export default function KPICards({ data, loading }) {
  if (loading) return (
    <Grid container spacing={2} mb={3}>
      {[...Array(6)].map((_, i) => <Grid item xs={12} sm={6} md={4} lg={2} key={i}><KPISkeleton /></Grid>)}
    </Grid>
  )
  if (!data) return null

  const cards = [
    { title: 'Total Records', value: data.total_entries, sub: `Across ${data.total_pcbs || 0} PCB types`, icon: StorageOutlinedIcon, color: '#00b4ff', glow: 'rgba(0,180,255,0.08)', delay: 0 },
    { title: 'Repair OK', value: data.ok_count, sub: `${data.ok_percentage || 0}% success rate`, icon: CheckCircleOutlineIcon, color: '#00e87a', glow: 'rgba(0,232,122,0.08)', delay: 0.06 },
    { title: 'No Fault Found', value: data.nff_count, sub: `${data.nff_percentage || 0}% NFF rate`, icon: HighlightOffIcon, color: '#ff9500', glow: 'rgba(255,149,0,0.08)', delay: 0.12 },
    { title: 'PCB Types', value: data.total_pcbs, sub: 'Unique part codes tracked', icon: MemoryIcon, color: '#a78bfa', glow: 'rgba(167,139,250,0.08)', delay: 0.18 },
    { title: 'Service Locations', value: data.total_branches, sub: 'Cities & branches covered', icon: LocationOnOutlinedIcon, color: '#ff4d4d', glow: 'rgba(255,77,77,0.08)', delay: 0.24 },
    { title: 'Pass Rate', value: parseFloat(data.pass_percentage || 0), sub: `${(data.pass_count || 0).toLocaleString()} passed testing`, icon: PercentOutlinedIcon, color: '#00ffcc', glow: 'rgba(0,255,204,0.08)', suffix: '%', isFloat: true, delay: 0.30 },
  ]

  return (
    <Grid container spacing={2} mb={3}>
      {cards.map((card, i) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
          <KPICard {...card} />
        </Grid>
      ))}
    </Grid>
  )
}
