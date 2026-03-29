import { Box, Typography, Skeleton } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'

const TT = {
  contentStyle: { background: '#0d1626', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '10px 14px' },
  formatter: (val, name) => [<span style={{ color: name === 'OK' ? '#00e87a' : '#ff9500', fontWeight: 700 }}>{Number(val).toLocaleString()}</span>, name]
}

export default function BranchChart({ data = [], loading }) {
  if (loading) return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Skeleton variant="text" width="45%" height={22} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
      <Skeleton variant="text" width="65%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={480} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
    </Box>
  )

  const top = data.slice(0, 12)

  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff', mb: 0.2 }}>Branch Distribution</Typography>
      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)', mb: 2 }}>
        {top.length > 0 ? `Top ${top.length} service locations — OK vs NFF split` : 'No branch data — upload Excel file'}
      </Typography>
      {top.length === 0 ? (
        <Box display="flex" alignItems="center" justifyContent="center" height={440} flexDirection="column" gap={1}>
          <Typography sx={{ fontSize: '2rem', opacity: 0.15 }}>🗺️</Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(120,160,210,0.25)', textAlign: 'center' }}>Branch data will appear after upload</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={480}>
          <BarChart data={top} barSize={20} margin={{ top: 5, right: 24, left: 0, bottom: 72 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="branch"
              tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 10 }}
              axisLine={false} tickLine={false}
              angle={-40} textAnchor="end" interval={0} />
            <YAxis
              tick={{ fill: 'rgba(120,160,210,0.5)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
              axisLine={false} tickLine={false} />
            <Tooltip {...TT} />
            <Legend
              wrapperStyle={{ paddingTop: 4, fontSize: 12 }}
              formatter={(v) => <span style={{ color: 'rgba(160,200,255,0.6)', fontSize: 11 }}>{v}</span>}
            />
            <Bar dataKey="ok_count" name="OK" stackId="a" fill="#00e87a" animationDuration={800} />
            <Bar dataKey="nff_count" name="NFF" stackId="a" fill="#ff9500" radius={[4, 4, 0, 0]} animationDuration={900} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Box>
  )
}
