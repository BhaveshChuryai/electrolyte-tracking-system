import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children, onRefresh }) {
  const router = useRouter()
  const [key, setKey] = useState(0)
  useEffect(() => { setKey(k => k + 1) }, [router.asPath])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#060c18' }}>
      {/* Ambient background */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 15% -5%, rgba(0,80,220,0.07) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 85% 100%, rgba(0,180,255,0.05) 0%, transparent 55%)' }} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
        {/* Navbar — plain Box, no AppBar */}
        <Navbar onRefresh={onRefresh} />

        {/* Page content */}
        <Box
          key={key}
          component="main"
          sx={{
            flexGrow: 1, overflow: 'auto',
            p: { xs: 2, md: 2.5 },
            animation: 'fadeUp 0.3s ease forwards',
            '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
          }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
