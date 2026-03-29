import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { Box, Typography, Grid, CircularProgress, Alert, Skeleton, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts'
import Layout from '../components/common/Layout'

const COLORS = ['#00e87a','#ff9500','#00b4ff','#a78bfa','#ff4d4d','#00ffcc','#ffdd00','#ff69b4']
const TT = {
  contentStyle: { background: '#0a1628', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '10px 14px' }
}

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={800}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function Card({ title, sub, children, delay = 0 }) {
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', height: '100%', animation: `fadeUp 0.5s ease ${delay}s both`, '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#eaf3ff', mb: 0.2 }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)', mb: 2.5 }}>{sub}</Typography>
      {children}
    </Box>
  )
}

function Empty({ h = 260 }) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" height={h} flexDirection="column" gap={1}>
      <Typography sx={{ fontSize: '1.5rem', opacity: 0.2 }}>📊</Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'rgba(120,160,210,0.25)', textAlign: 'center' }}>Upload data to see chart</Typography>
    </Box>
  )
}

function CardSk() {
  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Skeleton variant="text" width="45%" height={22} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
      <Skeleton variant="text" width="65%" height={16} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 2 }} />
      <Skeleton variant="rounded" width="100%" height={260} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '10px' }} />
    </Box>
  )
}

const selSx = {
  color: '#eaf3ff', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', fontSize: '0.78rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,180,255,0.3)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00b4ff' },
  '& .MuiSvgIcon-root': { color: 'rgba(120,160,210,0.5)' },
}
const mp = { PaperProps: { sx: { background: '#0d1626', border: '1px solid rgba(0,180,255,0.12)', borderRadius: '12px', '& .MuiMenuItem-root': { color: 'rgba(160,200,255,0.7)', fontSize: '0.8rem', '&:hover': { background: 'rgba(0,180,255,0.08)' }, '&.Mui-selected': { background: 'rgba(0,180,255,0.12)', color: '#00b4ff' } } } } }

export default function AnalyticsPage() {
  const [status, setStatus] = useState([])
  const [components, setComponents] = useState([])
  const [branches, setBranches] = useState([])
  const [trends, setTrends] = useState([])
  const [pcbList, setPcbList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Filters
  const [fPartCode, setFPartCode] = useState('all')
  const [fStatus, setFStatus] = useState('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (fPartCode !== 'all') params.append('part_code', fPartCode)
    if (fStatus !== 'all') params.append('status', fStatus)
    const q = params.toString() ? `?${params}` : ''

    try {
      const [s, c, b, t, p] = await Promise.allSettled([
        fetch(`/api/status${q}`).then(r => r.json()),
        fetch(`/api/components${q}&limit=15`).then(r => r.json()),
        fetch(`/api/branches${q}&limit=20`).then(r => r.json()),
        fetch(`/api/trends${q}`).then(r => r.json()),
        fetch('/api/pcb-list').then(r => r.json()),
      ])
      if (s.status === 'fulfilled' && Array.isArray(s.value)) setStatus(s.value)
      if (c.status === 'fulfilled' && Array.isArray(c.value)) setComponents(c.value)
      if (b.status === 'fulfilled' && Array.isArray(b.value)) setBranches(b.value)
      if (t.status === 'fulfilled' && Array.isArray(t.value)) setTrends(t.value)
      if (p.status === 'fulfilled' && Array.isArray(p.value)) setPcbList(p.value)
    } catch { setError('Failed to load analytics data') }
    finally { setLoading(false) }
  }, [fPartCode, fStatus])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <>
      <Head><title>Analytics — Electrolyte Bajaj</title></Head>
      <Layout>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#eaf3ff', letterSpacing: '-0.5px', mb: 0.3 }}>Analytics & Insights</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(120,160,210,0.45)' }}>Deep dive into PCB repair data patterns</Typography>
            </Box>
            {/* Filters */}
            <Box display="flex" gap={1.5} alignItems="center">
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel sx={{ color: 'rgba(120,160,210,0.45)', fontSize: '0.78rem' }}>PCB Code</InputLabel>
                <Select value={fPartCode} label="PCB Code" onChange={e => setFPartCode(e.target.value)} sx={selSx} MenuProps={mp}>
                  <MenuItem value="all">All PCBs</MenuItem>
                  {pcbList.map(p => <MenuItem key={p.part_code} value={p.part_code}>{p.part_code}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel sx={{ color: 'rgba(120,160,210,0.45)', fontSize: '0.78rem' }}>Status</InputLabel>
                <Select value={fStatus} label="Status" onChange={e => setFStatus(e.target.value)} sx={selSx} MenuProps={mp}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="OK">✅ OK</MenuItem>
                  <MenuItem value="NFF">⚠️ NFF</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', background: 'rgba(255,77,77,0.08)', border: '1px solid rgba(255,77,77,0.18)', color: '#ff4d4d', fontSize: '0.82rem' }}>{error}</Alert>}

          <Grid container spacing={2}>

            {/* Monthly Trends */}
            <Grid item xs={12}>
              {loading ? <CardSk /> : (
                <Card title="Monthly Repair Trends" sub="PCB repair volume over time — OK vs NFF" delay={0}>
                  {trends.length === 0 ? <Empty h={240} /> : (
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <defs>
                          {[['gOK','#00e87a'],['gNFF','#ff9500'],['gTot','#00b4ff']].map(([id,c]) => (
                            <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={c} stopOpacity={0.22} />
                              <stop offset="95%" stopColor={c} stopOpacity={0} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="month" tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(120,160,210,0.45)', fontSize: 11, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                        <Tooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':n==='NFF'?'#ff9500':'#00b4ff', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                        <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 11 }} />
                        <Area type="monotone" dataKey="total" name="Total" stroke="#00b4ff" strokeWidth={1.8} fill="url(#gTot)" dot={false} animationDuration={900} />
                        <Area type="monotone" dataKey="ok_count" name="OK" stroke="#00e87a" strokeWidth={2.5} fill="url(#gOK)" dot={{ fill: '#00e87a', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1000} />
                        <Area type="monotone" dataKey="nff_count" name="NFF" stroke="#ff9500" strokeWidth={2.5} fill="url(#gNFF)" dot={{ fill: '#ff9500', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} animationDuration={1100} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              )}
            </Grid>

            {/* Overall Status FIXED */}
            <Grid item xs={12} md={4}>
              {loading ? <CardSk /> : (
                <Card title="Overall Status" sub={`OK vs NFF ratio${fPartCode !== 'all' ? ` · PCB ${fPartCode}` : ''}`} delay={0.06}>
                  {status.length === 0 ? <Empty /> : (
                    <Box>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                          <Pie
                            data={status}
                            cx="50%" cy="45%"
                            innerRadius={60} outerRadius={98}
                            paddingAngle={4}
                            dataKey="count"
                            nameKey="status"
                            labelLine={false}
                            label={renderPieLabel}
                            animationBegin={200}
                            animationDuration={900}>
                            {status.map((e, i) => (
                              <Cell key={i} fill={e.status === 'OK' ? '#00e87a' : '#ff9500'} />
                            ))}
                          </Pie>
                          <Tooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()} records</span>, n]} />
                          <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
                            formatter={(val, e) => (
                              <span style={{ color: 'rgba(160,200,255,0.65)', fontSize: 11 }}>
                                {val}: <strong style={{ color: '#eaf3ff' }}>{Number(e.payload?.count||0).toLocaleString()}</strong>
                                {e.payload?.percentage ? ` · ${e.payload.percentage}%` : ''}
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Stat pills */}
                      <Box display="flex" gap={1} justifyContent="center" mt={0.5}>
                        {status.map((s, i) => (
                          <Box key={i} sx={{ px: 1.5, py: 0.6, borderRadius: '8px', background: s.status==='OK'?'rgba(0,232,122,0.08)':'rgba(255,149,0,0.08)', border: `1px solid ${s.status==='OK'?'rgba(0,232,122,0.2)':'rgba(255,149,0,0.2)'}`, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: s.status==='OK'?'#00e87a':'#ff9500', fontFamily: "'DM Mono',monospace", lineHeight: 1.2 }}>{Number(s.count).toLocaleString()}</Typography>
                            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(160,200,255,0.45)', fontWeight: 600 }}>{s.status} · {s.percentage}%</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Card>
              )}
            </Grid>

            {/* PCB Type Comparison */}
            <Grid item xs={12} md={8}>
              {loading ? <CardSk /> : (
                <Card title="PCB Type Comparison" sub="Total entries by PCB part code — OK vs NFF" delay={0.1}>
                  {pcbList.length === 0 ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={pcbList} barSize={26} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="part_code" tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'rgba(120,160,210,0.45)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                        <Tooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                        <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 11 }} />
                        <Bar dataKey="ok_count" name="OK" stackId="a" fill="#00e87a" animationDuration={800} />
                        <Bar dataKey="nff_count" name="NFF" stackId="a" fill="#ff9500" radius={[4, 4, 0, 0]} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              )}
            </Grid>

            {/* Top Components — large */}
            <Grid item xs={12} md={6}>
              {loading ? <CardSk /> : (
                <Card title="Top Components Consumed" sub={`Most replaced components${fPartCode !== 'all' ? ` · PCB ${fPartCode}` : ' across all PCBs'}`} delay={0.14}>
                  {components.length === 0 ? <Empty h={300} /> : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={components.slice(0, 13)} layout="vertical" barSize={14} margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="component" type="category" tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                        <Tooltip {...TT} formatter={(v) => [<span style={{ color: '#00b4ff', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, 'Count']} />
                        <Bar dataKey="total_count" name="Count" radius={[0, 4, 4, 0]} animationDuration={900}>
                          {components.slice(0, 13).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              )}
            </Grid>

            {/* Top Branches */}
            <Grid item xs={12} md={6}>
              {loading ? <CardSk /> : (
                <Card title="Top Service Branches" sub="Cities sending most PCBs for repair" delay={0.18}>
                  {branches.length === 0 ? <Empty h={300} /> : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={branches.slice(0, 12)} layout="vertical" barSize={14} margin={{ left: 10, right: 24, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="branch" type="category" tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                        <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 11 }} />
                        <Bar dataKey="ok_count" name="OK" stackId="a" fill="#00e87a" animationDuration={800} />
                        <Bar dataKey="nff_count" name="NFF" stackId="a" fill="#ff9500" radius={[0, 4, 4, 0]} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Card>
              )}
            </Grid>

          </Grid>
        </Box>
      </Layout>
    </>
  )
}
