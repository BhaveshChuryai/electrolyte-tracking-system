import { Box, Typography, Skeleton } from '@mui/material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const TT = { contentStyle: { background: '#0d1626', border: '1px solid rgba(0,180,255,0.15)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' } }

export default function TrendsChart({ data = [], loading }) {
  if (loading) return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)', mb: 2 }}>
      <Skeleton variant="text" width="40%" height={22} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
      <Skeleton variant="text" width="60%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
    </Box>
  )
  if (!data || data.length === 0) return null

  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', mb: 2 }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff', mb: 0.2 }}>Monthly Repair Trends</Typography>
      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)', mb: 2.5 }}>PCB repair volume over time — OK vs NFF</Typography>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gOK" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e87a" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#00e87a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gNFF" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9500" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#ff9500" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'rgba(160,200,255,0.45)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(120,160,210,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 11 }} />
          <Area type="monotone" dataKey="ok_count" name="OK" stroke="#00e87a" strokeWidth={2.5} fill="url(#gOK)" dot={{ fill: '#00e87a', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1000} />
          <Area type="monotone" dataKey="nff_count" name="NFF" stroke="#ff9500" strokeWidth={2.5} fill="url(#gNFF)" dot={{ fill: '#ff9500', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1100} />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
