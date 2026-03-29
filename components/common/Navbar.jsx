import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Box, Typography, IconButton, Chip, Avatar, Menu, MenuItem, Divider, Badge, Tooltip } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshIcon from '@mui/icons-material/Refresh'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

const pageTitles = {
  '/dashboard': 'Overview Dashboard',
  '/analytics': 'Analytics & Insights',
  '/map-analytics': 'Map Analytics',
  '/master-table': 'Master Table',
  '/upload': 'Upload Data',
}

export default function Navbar({ onRefresh }) {
  const router = useRouter()
  const [time, setTime] = useState(new Date())
  const [anchorEl, setAnchorEl] = useState(null)
  const [spin, setSpin] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const doRefresh = () => {
    setSpin(true)
    onRefresh?.()
    setTimeout(() => setSpin(false), 800)
  }

  const title = pageTitles[router.pathname] || (router.pathname.startsWith('/master-table/') ? 'PCB Detail' : 'Dashboard')

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      px: 3, height: 58,
      background: 'rgba(7,16,31,0.98)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      {/* LEFT */}
      <Box display="flex" alignItems="center" gap={2}>
        <Box sx={{
          width: 68, height: 32, borderRadius: '7px', overflow: 'hidden',
          background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <img src="/logo.jpeg" alt="logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={e => e.target.style.display = 'none'} />
        </Box>

        <Box sx={{ width: 1, height: 26, background: 'rgba(255,255,255,0.08)' }} />

        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff', letterSpacing: '-0.2px', lineHeight: 1.3 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', color: 'rgba(120,160,210,0.4)', letterSpacing: '0.3px' }}>
            PCB Intelligence · Bajaj Auto
          </Typography>
        </Box>
      </Box>

      {/* RIGHT */}
      <Box display="flex" alignItems="center" gap={1.2}>
        {/* Clock */}
        <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' }, mr: 0.5 }}>
          <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#eaf3ff', fontFamily: "'DM Mono', monospace", lineHeight: 1.3 }}>
            {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Typography>
          <Typography sx={{ fontSize: '0.58rem', color: 'rgba(120,160,210,0.4)' }}>
            {time.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Typography>
        </Box>

        <Box sx={{ width: 1, height: 22, background: 'rgba(255,255,255,0.07)', display: { xs: 'none', md: 'block' } }} />

        {/* Live */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.1, py: 0.35, borderRadius: '20px', background: 'rgba(0,232,122,0.07)', border: '1px solid rgba(0,232,122,0.18)' }}>
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#00e87a', boxShadow: '0 0 6px #00e87a', animation: 'blink 2s infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
          <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#00e87a', letterSpacing: '0.5px' }}>LIVE</Typography>
        </Box>

        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton onClick={doRefresh} size="small" sx={{ color: 'rgba(160,200,255,0.4)', '&:hover': { color: '#00b4ff', background: 'rgba(0,180,255,0.08)' } }}>
              <RefreshIcon fontSize="small" sx={{ transition: 'transform 0.7s', transform: spin ? 'rotate(360deg)' : 'none' }} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: 'rgba(160,200,255,0.4)', '&:hover': { color: '#00b4ff', background: 'rgba(0,180,255,0.08)' } }}>
            <Badge badgeContent={0} color="error"><NotificationsNoneIcon fontSize="small" /></Badge>
          </IconButton>
        </Tooltip>

        {/* User */}
        <Box onClick={e => setAnchorEl(e.currentTarget)} sx={{
          display: 'flex', alignItems: 'center', gap: 0.9,
          px: 1.1, py: 0.5, borderRadius: '9px',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.03)',
          cursor: 'pointer', transition: 'all 0.2s',
          '&:hover': { border: '1px solid rgba(0,180,255,0.22)', background: 'rgba(0,180,255,0.05)' }
        }}>
          <Avatar sx={{ width: 25, height: 25, background: 'linear-gradient(135deg, #00b4ff, #0044dd)', fontSize: '0.68rem', fontWeight: 800 }}>B</Avatar>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#eaf3ff', lineHeight: 1.2 }}>Bhavesh</Typography>
            <Typography sx={{ fontSize: '0.56rem', color: 'rgba(120,160,210,0.5)' }}>Admin</Typography>
          </Box>
        </Box>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
          PaperProps={{ sx: { background: '#0d1626', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', mt: 1, minWidth: 165, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' } }}>
          <MenuItem sx={{ color: 'rgba(160,200,255,0.7)', gap: 1.5, fontSize: '0.8rem', py: 1.1, '&:hover': { background: 'rgba(0,180,255,0.08)' } }}>
            <PersonOutlineIcon fontSize="small" /> My Profile
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 0.3 }} />
          <MenuItem onClick={() => router.push('/')} sx={{ color: '#ff4d4d', gap: 1.5, fontSize: '0.8rem', py: 1.1, '&:hover': { background: 'rgba(255,68,68,0.08)' } }}>
            <LogoutIcon fontSize="small" /> Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}
