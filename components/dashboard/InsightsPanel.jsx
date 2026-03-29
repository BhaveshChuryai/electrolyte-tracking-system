import { Box, Typography, Skeleton } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { useState, useEffect } from 'react'

export default function InsightsPanel() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/insights')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setInsights(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)', mb: 2 }}>
      <Skeleton variant="text" width="35%" height={22} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 2 }} />
      <Box display="flex" gap={1.5} flexWrap="wrap">
        {[...Array(4)].map((_,i) => <Skeleton key={i} variant="rounded" width={200} height={72} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />)}
      </Box>
    </Box>
  )

  if (insights.length === 0) return null

  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', mb: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <AutoAwesomeIcon sx={{ color: '#a78bfa', fontSize: 16 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff' }}>Smart Insights</Typography>
        <Box sx={{ px: 0.8, py: 0.2, borderRadius: '6px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <Typography sx={{ fontSize: '0.58rem', color: '#a78bfa', fontWeight: 700 }}>AUTO</Typography>
        </Box>
      </Box>
      <Box display="flex" gap={1.5} flexWrap="wrap">
        {insights.map((insight, i) => (
          <Box key={i} sx={{
            p: 1.8, borderRadius: '12px', flex: '1 1 180px', minWidth: 160,
            background: `${insight.color}08`,
            border: `1px solid ${insight.color}18`,
            animation: `fadeUp 0.4s ease ${i * 0.08}s both`,
            '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
            transition: 'all 0.2s', '&:hover': { border: `1px solid ${insight.color}35`, transform: 'translateY(-2px)' }
          }}>
            <Typography sx={{ fontSize: '1.2rem', mb: 0.5 }}>{insight.icon}</Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.5)', mb: 0.2, letterSpacing: '0.3px' }}>{insight.title}</Typography>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: insight.color, mb: 0.2, fontFamily: "'DM Mono', monospace" }}>{insight.value}</Typography>
            <Typography sx={{ fontSize: '0.62rem', color: 'rgba(120,160,210,0.4)' }}>{insight.detail}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
