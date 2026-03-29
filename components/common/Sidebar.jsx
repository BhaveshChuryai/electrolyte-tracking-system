import { useRouter } from 'next/router'
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'

const items = [
  { label: 'Dashboard', icon: DashboardOutlinedIcon, path: '/dashboard', desc: 'Overview & KPIs' },
  { label: 'Analytics', icon: AnalyticsOutlinedIcon, path: '/analytics', desc: 'Deep insights' },
  { label: 'Map Analytics', icon: MapOutlinedIcon, path: '/map-analytics', desc: 'India heatmap' },
  { label: 'Master Table', icon: TableChartOutlinedIcon, path: '/master-table', desc: 'All PCB codes' },
  { label: 'Upload Data', icon: UploadFileOutlinedIcon, path: '/upload', desc: 'Import Excel' },
]

export default function Sidebar() {
  const router = useRouter()
  const active = (path) => router.pathname === path || router.pathname.startsWith(path + '/')

  return (
    <Box sx={{
      width: 220, minHeight: '100vh', flexShrink: 0,
      background: '#07101f',
      borderRight: '1px solid rgba(255,255,255,0.055)',
      display: 'flex', flexDirection: 'column',
      position: 'sticky', top: 0, height: '100vh',
    }}>
      {/* Logo */}
      <Box sx={{ p: 2.2, borderBottom: '1px solid rgba(255,255,255,0.055)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,180,255,0.2), rgba(0,80,255,0.15))', border: '1px solid rgba(0,180,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MemoryOutlinedIcon sx={{ color: '#00b4ff', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', background: 'linear-gradient(135deg, #eaf3ff, #00b4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>Electrolyte</Typography>
          <Typography sx={{ fontSize: '0.58rem', color: 'rgba(100,150,200,0.4)' }}>PCB Analytics</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2.5, pt: 2, pb: 0.8 }}>
        <Typography sx={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(100,150,200,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Navigation</Typography>
      </Box>

      <List sx={{ px: 1.2, flexGrow: 1, pt: 0 }}>
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active(item.path)
          return (
            <ListItem key={item.label} onClick={() => router.push(item.path)}
              sx={{
                mb: 0.3, borderRadius: '10px', cursor: 'pointer', py: 0.9, px: 1.2,
                background: isActive ? 'linear-gradient(135deg, rgba(0,180,255,0.12), rgba(0,80,255,0.07))' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(0,180,255,0.2)' : 'transparent'}`,
                transition: 'all 0.2s ease',
                '&:hover': { background: isActive ? 'linear-gradient(135deg, rgba(0,180,255,0.16), rgba(0,80,255,0.1))' : 'rgba(255,255,255,0.035)', border: '1px solid rgba(0,180,255,0.12)', transform: 'translateX(3px)' },
              }}>
              <ListItemIcon sx={{ minWidth: 32, color: isActive ? '#00b4ff' : 'rgba(120,160,210,0.4)', transition: 'color 0.2s' }}>
                <Icon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.desc}
                primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 400, color: isActive ? '#eaf3ff' : 'rgba(140,180,230,0.5)', lineHeight: 1.3 }}
                secondaryTypographyProps={{ fontSize: '0.58rem', color: 'rgba(100,140,190,0.3)', mt: 0 }}
              />
              {isActive && <Box sx={{ width: 3, height: 3, borderRadius: '50%', background: '#00b4ff', boxShadow: '0 0 8px #00b4ff', flexShrink: 0 }} />}
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mx: 1.5 }} />
      <List sx={{ px: 1.2, py: 1 }}>
        <ListItem sx={{ borderRadius: '10px', cursor: 'pointer', py: 0.8, px: 1.2, '&:hover': { background: 'rgba(255,255,255,0.03)' } }}>
          <ListItemIcon sx={{ minWidth: 32, color: 'rgba(100,140,190,0.35)' }}><SettingsOutlinedIcon sx={{ fontSize: 17 }} /></ListItemIcon>
          <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.78rem', color: 'rgba(120,160,210,0.4)' }} />
        </ListItem>
      </List>

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.15)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.6}>
          <Box display="flex" alignItems="center" gap={0.7}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#00e87a', boxShadow: '0 0 6px #00e87a', animation: 'pulse 2.5s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(0,232,122,0.6)', fontWeight: 600 }}>Online</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.58rem', color: 'rgba(100,140,190,0.25)' }}>v2.0.0</Typography>
        </Box>
        <Typography sx={{ fontSize: '0.58rem', color: 'rgba(100,140,190,0.22)' }}>© 2025 Bajaj Auto Limited</Typography>
      </Box>
    </Box>
  )
}
