import { Box, Typography, Skeleton } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'

const COLORS = ['#00e87a','#ff9500','#00b4ff','#a78bfa','#ff4d4d','#00ffcc','#ffdd00','#ff69b4']

const TT = {
  contentStyle: { background: '#0d1626', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '10px 14px' },
  itemStyle: { color: '#eaf3ff' },
  labelStyle: { color: 'rgba(160,200,255,0.6)' },
}

function Card({ title, sub, children }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', height: '100%' }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff', mb: 0.2 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)', mb: 2 }}>{sub}</Typography>
      {children}
    </Box>
  )
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>
}

function Empty({ h = 200, msg = 'No data — upload Excel file' }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" height={h} flexDirection="column" gap={1}>
      <Typography sx={{ fontSize: '1.6rem', opacity: 0.2 }}>📊</Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(120,160,210,0.3)', textAlign: 'center' }}>{msg}</Typography>
    </Box>
  )
}

function SkCard() {
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Skeleton variant="text" width="50%" height={22} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
      <Skeleton variant="text" width="70%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
    </Box>
  )
}

export default function StatusCharts({ statusData = [], componentData = [], loading }) {
  if (loading) return <Box display="flex" flexDirection="column" gap={2} height="100%"><SkCard /><SkCard /></Box>

  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">

      {/* Status Donut */}
      <Card title="Status Distribution" sub="OK vs NFF repair outcome">
        {statusData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={230}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={statusData}
                cx="50%" cy="45%"
                innerRadius={60} outerRadius={95}
                paddingAngle={3}
                dataKey="count"
                nameKey="status"
                labelLine={false}
                label={renderLabel}
                animationBegin={0}
                animationDuration={900}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.status === 'OK' ? '#00e87a' : '#ff9500'} />
                ))}
              </Pie>
              <Tooltip
                {...TT}
                formatter={(val, name) => [
                  <span style={{ color: name === 'OK' ? '#00e87a' : '#ff9500', fontWeight: 700 }}>{Number(val).toLocaleString()} records</span>,
                  name
                ]}
              />
              <Legend
                wrapperStyle={{ paddingTop: 8, fontSize: 12 }}
                formatter={(value, entry) => (
                  <span style={{ color: 'rgba(160,200,255,0.6)', fontSize: 12 }}>
                    {value}: <strong style={{ color: '#eaf3ff' }}>{Number(entry.payload?.count || 0).toLocaleString()}</strong>
                    {entry.payload?.percentage ? ` (${entry.payload.percentage}%)` : ''}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Top Components Bar */}
      <Card title="Top Components" sub="Most consumed in repairs">
        {componentData.length === 0 ? <Empty /> : (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart
              data={componentData.slice(0, 8)}
              layout="vertical"
              barSize={11}
              margin={{ left: 8, right: 20, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: 'rgba(160,200,255,0.5)', fontSize: 10, fontFamily: "'DM Mono', monospace" }}
                axisLine={false} tickLine={false} />
              <YAxis
                dataKey="component"
                type="category"
                tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 10 }}
                axisLine={false} tickLine={false} width={52} />
              <Tooltip
                {...TT}
                formatter={(val) => [<span style={{ color: '#00b4ff', fontWeight: 700 }}>{Number(val).toLocaleString()}</span>, 'Count']}
              />
              <Bar dataKey="total_count" name="Count" radius={[0, 4, 4, 0]} animationDuration={800}>
                {componentData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </Box>
  )
}
