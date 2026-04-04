import { useRouter } from 'next/router'
import { Box, Typography, List, ListItem, Divider, Tooltip, Badge } from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined'
import { useEffect, useState } from 'react'

const NAV = [
  { label: 'Dashboard', icon: DashboardOutlinedIcon, path: '/dashboard', desc: 'Overview & KPIs' },
  { label: 'Analytics', icon: AnalyticsOutlinedIcon, path: '/analytics', desc: 'Deep insights' },
  { label: 'Map Analytics', icon: MapOutlinedIcon, path: '/map-analytics', desc: 'India heatmap' },
  { label: 'Master Table', icon: TableChartOutlinedIcon, path: '/master-table', desc: 'All PCB codes' },
  { label: 'Upload Data', icon: UploadFileOutlinedIcon, path: '/upload', desc: 'Import Excel' },
  { label: 'Auto-Corrections', icon: PsychologyOutlinedIcon, path: '/corrections', desc: 'Review & fix data', badge: true },
]

export default function Sidebar() {
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)
  const isActive = p => router.pathname === p || router.pathname.startsWith(p + '/')

  useEffect(() => {
    fetch('/api/corrections?type=stats')
      .then(r => r.json())
      .then(d => setPendingCount(parseInt(d?.flagged?.pending || 0)))
      .catch(() => {})
  }, [router.pathname])

  return (
    <Box sx={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: '#080e1a',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.2, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: '9px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MemoryOutlinedIcon sx={{ color: '#fff', fontSize: 17 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#f1f5f9', lineHeight: 1.2, fontFamily: 'Inter' }}>Electrolyte</Typography>
          <Typography sx={{ fontSize: '0.58rem', color: '#475569', fontFamily: 'Inter' }}>PCB Analytics v2</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 0.8 }}>
        <Typography sx={{ fontSize: '0.58rem', fontWeight: 600, color: '#334155', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Inter' }}>Menu</Typography>
      </Box>

      <List sx={{ px: 1.5, flexGrow: 1, pt: 0 }}>
        {NAV.map(item => {
          const Icon = item.icon
          const active = isActive(item.path)
          const showBadge = item.badge && pendingCount > 0

          return (
            <Tooltip key={item.label} title={item.desc} placement="right" arrow
              componentsProps={{ tooltip: { sx: { background: '#1e293b', fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.08)' } } }}>
              <ListItem onClick={() => router.push(item.path)} sx={{
                mb: 0.3, borderRadius: '9px', cursor: 'pointer', py: 0.9, px: 1.2,
                background: active ? 'rgba(59,130,246,0.12)' : 'transparent',
                border: `1px solid ${active ? 'rgba(59,130,246,0.22)' : 'transparent'}`,
                transition: 'all 0.18s',
                '&:hover': { background: active ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}` },
              }}>
                <Badge badgeContent={showBadge ? pendingCount : 0} color="warning" sx={{ '& .MuiBadge-badge': { fontSize: '0.5rem', height: 14, minWidth: 14, background: '#f59e0b' } }}>
                  <Icon sx={{ fontSize: 17, color: active ? '#3b82f6' : item.path === '/corrections' ? '#8b5cf6' : '#475569', mr: 1.3, flexShrink: 0 }} />
                </Badge>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: active ? 600 : 400, color: active ? '#f1f5f9' : item.path === '/corrections' ? '#c4b5fd' : '#64748b', fontFamily: 'Inter', lineHeight: 1.2 }}>{item.label}</Typography>
                </Box>
                {active && <Box sx={{ ml: 'auto', width: 5, height: 5, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 6px #3b82f6', flexShrink: 0 }} />}
              </ListItem>
            </Tooltip>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 1.5 }} />
      <List sx={{ px: 1.5, py: 1 }}>
        <ListItem sx={{ borderRadius: '9px', cursor: 'pointer', py: 0.8, px: 1.2, '&:hover': { background: 'rgba(255,255,255,0.03)' } }}>
          <SettingsOutlinedIcon sx={{ fontSize: 16, color: '#334155', mr: 1.3 }} />
          <Typography sx={{ fontSize: '0.78rem', color: '#334155', fontFamily: 'Inter' }}>Settings</Typography>
        </ListItem>
      </List>

      <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Box display="flex" alignItems="center" gap={0.7} mb={0.5}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e', animation: 'blink 2.5s infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
          <Typography sx={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 600, fontFamily: 'Inter' }}>System Online</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.58rem', color: '#334155', fontFamily: 'Inter' }}>© 2025 Bajaj Auto Limited</Typography>
      </Box>
    </Box>
  )
}
