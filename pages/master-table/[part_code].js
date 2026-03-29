import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Box, Typography, Grid, CircularProgress, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, IconButton, Tooltip, Alert, Select, MenuItem, FormControl, InputLabel, Skeleton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import MemoryIcon from '@mui/icons-material/Memory'
import { PieChart, Pie, Cell, Tooltip as RTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Layout from '../../components/common/Layout'

const COLORS = ['#00b4ff','#00e87a','#ff9500','#a78bfa','#ff4d4d','#00ffcc','#ffdd00','#ff69b4','#7dd3fc','#86efac']
const TT = {
  contentStyle: { background: '#0a1628', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '10px 14px' }
}
const cs = { color: 'rgba(160,200,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.76rem', py: 1.2, px: 1.5 }

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * Math.PI / 180)
  const y = cy + r * Math.sin(-midAngle * Math.PI / 180)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={800}>{`${(percent*100).toFixed(0)}%`}</text>
}

const selSx = {
  color: '#eaf3ff', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', fontSize: '0.76rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,180,255,0.3)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00b4ff' },
  '& .MuiSvgIcon-root': { color: 'rgba(120,160,210,0.5)' },
}
const mp = { PaperProps: { sx: { background: '#0d1626', border: '1px solid rgba(0,180,255,0.12)', borderRadius: '12px', maxHeight: 280, '& .MuiMenuItem-root': { color: 'rgba(160,200,255,0.7)', fontSize: '0.76rem', '&:hover': { background: 'rgba(0,180,255,0.08)' } } } } }

export default function PCBDetailPage() {
  const router = useRouter()
  const { part_code } = router.query
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [rpp, setRpp] = useState(10)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterBranch, setFilterBranch] = useState('all')

  const fetchDetail = async () => {
    if (!part_code) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ part_code, page: page + 1, limit: rpp })
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterBranch !== 'all') params.append('branch', filterBranch)
      const r = await fetch(`/api/pcb-detail?${params}`)
      const d = await r.json()
      setData(d)
    } catch { setData(null) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDetail() }, [part_code, page, rpp, filterStatus, filterBranch])

  const handleExport = () => {
    if (!data?.data) return
    const headers = ['#','DC No','Branch','Defect','Testing','Status','Analysis','Components','Engg']
    const csv = [headers.join(','), ...data.data.map((r,i) => [i+1, r.dc_no||'', r.branch||'', r.defect||'', r.testing||'', r.status||'', `"${r.analysis||''}"`, `"${r.component_consumption||''}"`, r.engg_name||''].join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `PCB_${part_code}.csv`; a.click()
  }

  if (!part_code) return null

  const cardStyle = { p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)' }

  return (
    <>
      <Head><title>PCB {part_code} — Electrolyte Bajaj</title></Head>
      <Layout>
        <Box>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/master-table')}
              sx={{ color: 'rgba(160,200,255,0.5)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '9px', fontSize: '0.78rem', '&:hover': { color: '#eaf3ff', border: '1px solid rgba(255,255,255,0.2)' } }}>
              Back
            </Button>
            <Box sx={{ p: 0.9, borderRadius: '10px', background: 'rgba(0,180,255,0.1)', border: '1px solid rgba(0,180,255,0.2)', display: 'inline-flex' }}>
              <MemoryIcon sx={{ color: '#00b4ff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#eaf3ff', letterSpacing: '-0.5px' }}>PCB {part_code}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)' }}>{data?.master?.product_description || 'Loading product info...'}</Typography>
            </Box>
          </Box>

          {loading && !data ? (
            <Box display="flex" justifyContent="center" alignItems="center" height={400}>
              <Box textAlign="center"><CircularProgress sx={{ color: '#00b4ff', mb: 2 }} /><Typography sx={{ color: 'rgba(120,160,210,0.4)', fontSize: '0.8rem' }}>Loading PCB analysis...</Typography></Box>
            </Box>
          ) : data && (
            <>
              {/* Summary chips */}
              <Box display="flex" gap={1.5} flexWrap="wrap" mb={3}>
                {[
                  { l: `Total: ${data.total?.toLocaleString() || 0}`, c: '#00b4ff' },
                  { l: `OK: ${data.status_breakdown?.find(s => s.status==='OK')?.count || 0}`, c: '#00e87a' },
                  { l: `NFF: ${data.status_breakdown?.find(s => s.status==='NFF')?.count || 0}`, c: '#ff9500' },
                  { l: `Branches: ${data.branch_breakdown?.length || 0}`, c: '#a78bfa' },
                  { l: `Components: ${data.component_breakdown?.length || 0}`, c: '#ff4d4d' },
                ].map((chip, i) => (
                  <Chip key={i} label={chip.l} sx={{ background: `${chip.c}12`, border: `1px solid ${chip.c}25`, color: chip.c, fontWeight: 700, fontSize: '0.75rem', height: 26 }} />
                ))}
              </Box>

              {/* COMPONENT CONSUMPTION — PRIMARY, LARGE */}
              <Box sx={{ ...cardStyle, mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#eaf3ff', mb: 0.2 }}>Component Consumption Analysis</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)', mb: 2.5 }}>
                  Most replaced components for PCB {part_code} — ordered by frequency
                </Typography>
                {data.component_breakdown?.length === 0 ? (
                  <Box textAlign="center" py={4}><Typography sx={{ color: 'rgba(120,160,210,0.25)', fontSize: '0.8rem' }}>No component data available</Typography></Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.component_breakdown} barSize={22} margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="component" tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(120,160,210,0.5)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                      <RTooltip {...TT}
                        formatter={(v, n, props) => [
                          <span style={{ color: '#00b4ff', fontWeight: 700 }}>{Number(v).toLocaleString()} times</span>,
                          props.payload?.component
                        ]}
                        labelFormatter={() => ''}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null
                          const d = payload[0].payload
                          return (
                            <Box sx={{ background: '#0a1628', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', p: 1.5 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#eaf3ff', mb: 0.5 }}>{d.component}</Typography>
                              {d.description && d.description !== 'N/A' && <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.5)', mb: 0.5 }}>{d.description}</Typography>}
                              <Typography sx={{ fontSize: '0.75rem', color: '#00b4ff', fontWeight: 700 }}>{Number(d.count).toLocaleString()} replacements</Typography>
                            </Box>
                          )
                        }}
                      />
                      <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]} animationDuration={800}>
                        {data.component_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Box>

              {/* Charts Row 2 */}
              <Grid container spacing={2} mb={2}>
                {/* Status */}
                <Grid item xs={12} md={4}>
                  <Box sx={cardStyle}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#eaf3ff', mb: 0.2 }}>Status Breakdown</Typography>
                    <Typography sx={{ fontSize: '0.63rem', color: 'rgba(120,160,210,0.4)', mb: 2 }}>OK vs NFF distribution</Typography>
                    {data.status_breakdown?.length === 0 ? (
                      <Box textAlign="center" py={4}><Typography sx={{ color: 'rgba(120,160,210,0.25)', fontSize: '0.75rem' }}>No data</Typography></Box>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                          <Pie data={data.status_breakdown} cx="50%" cy="45%" innerRadius={52} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="status" labelLine={false} label={renderPieLabel} animationBegin={0} animationDuration={900}>
                            {data.status_breakdown.map((e, i) => <Cell key={i} fill={e.status==='OK'?'#00e87a':'#ff9500'} />)}
                          </Pie>
                          <RTooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                          <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} formatter={(v, e) => <span style={{ color: 'rgba(160,200,255,0.6)' }}>{v}: <strong style={{ color: '#eaf3ff' }}>{Number(e.payload?.count||0).toLocaleString()}</strong></span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Grid>

                {/* Branch */}
                <Grid item xs={12} md={8}>
                  <Box sx={cardStyle}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#eaf3ff', mb: 0.2 }}>Branch / Location Distribution</Typography>
                    <Typography sx={{ fontSize: '0.63rem', color: 'rgba(120,160,210,0.4)', mb: 2 }}>Where PCBs are coming from — OK vs NFF per city</Typography>
                    {data.branch_breakdown?.length === 0 ? (
                      <Box textAlign="center" py={4}><Typography sx={{ color: 'rgba(120,160,210,0.25)', fontSize: '0.75rem' }}>No branch data</Typography></Box>
                    ) : (
                      <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={data.branch_breakdown.slice(0, 10)} layout="vertical" barSize={14} margin={{ left: 8, right: 20, top: 4, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                          <XAxis type="number" tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="branch" type="category" tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 9 }} axisLine={false} tickLine={false} width={68} />
                          <RTooltip {...TT} formatter={(v, n) => [<span style={{ color: n==='OK'?'#00e87a':'#ff9500', fontWeight: 700 }}>{Number(v).toLocaleString()}</span>, n]} />
                          <Legend wrapperStyle={{ color: 'rgba(160,200,255,0.5)', fontSize: 11 }} />
                          <Bar dataKey="ok_count" name="OK" stackId="a" fill="#00e87a" animationDuration={800} />
                          <Bar dataKey="nff_count" name="NFF" stackId="a" fill="#ff9500" radius={[0, 3, 3, 0]} animationDuration={900} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </Box>
                </Grid>
              </Grid>

              {/* Records table */}
              <Box sx={cardStyle}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.2}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#eaf3ff' }}>Repair Records</Typography>
                    <Typography sx={{ fontSize: '0.63rem', color: 'rgba(120,160,210,0.4)' }}>{data.total} records · page {page+1}</Typography>
                  </Box>
                  <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: 110 }}>
                      <InputLabel sx={{ color: 'rgba(120,160,210,0.45)', fontSize: '0.75rem' }}>Status</InputLabel>
                      <Select value={filterStatus} label="Status" onChange={e => { setFilterStatus(e.target.value); setPage(0) }} sx={selSx} MenuProps={mp}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="OK">✅ OK</MenuItem>
                        <MenuItem value="NFF">⚠️ NFF</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <InputLabel sx={{ color: 'rgba(120,160,210,0.45)', fontSize: '0.75rem' }}>Branch</InputLabel>
                      <Select value={filterBranch} label="Branch" onChange={e => { setFilterBranch(e.target.value); setPage(0) }} sx={selSx} MenuProps={mp}>
                        <MenuItem value="all">All Branches</MenuItem>
                        {(data.branch_breakdown || []).map(b => (
                          <MenuItem key={b.branch} value={b.branch}>{b.branch} ({b.count})</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Export CSV">
                      <IconButton onClick={handleExport} size="small" sx={{ color: 'rgba(120,160,210,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px', p: 0.7, '&:hover': { color: '#00e87a', border: '1px solid rgba(0,232,122,0.25)' } }}>
                        <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <TableContainer sx={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(0,0,0,0.3)' }}>
                        {['#','DC No','Branch','Defect','Testing','Status','Analysis','Components','Engg'].map(h => (
                          <TableCell key={h} sx={{ color: 'rgba(100,140,190,0.45)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.1px', textTransform: 'uppercase', py: 1.2, px: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(data.data || []).map((row, i) => (
                        <TableRow key={row.id || i} sx={{ '&:hover': { background: 'rgba(0,180,255,0.05)' }, background: i%2===0?'transparent':'rgba(255,255,255,0.01)' }}>
                          <TableCell sx={cs}>{page*rpp+i+1}</TableCell>
                          <TableCell sx={{ ...cs, color: '#00b4ff', fontWeight: 600, fontSize: '0.72rem', fontFamily: "'DM Mono',monospace" }}>{row.dc_no || '—'}</TableCell>
                          <TableCell sx={cs}>{row.branch || '—'}</TableCell>
                          <TableCell sx={cs}>{row.defect || '—'}</TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.2, px: 1.5 }}>
                            <Chip label={row.testing || '—'} size="small"
                              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700,
                                background: (row.testing==='Pass'||row.testing==='PASS') ? 'rgba(0,232,122,0.1)' : 'rgba(255,77,77,0.1)',
                                border: `1px solid ${(row.testing==='Pass'||row.testing==='PASS') ? 'rgba(0,232,122,0.25)' : 'rgba(255,77,77,0.25)'}`,
                                color: (row.testing==='Pass'||row.testing==='PASS') ? '#00e87a' : '#ff4d4d' }} />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.2, px: 1.5 }}>
                            <Chip label={row.status || '—'} size="small"
                              sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700,
                                background: row.status==='OK' ? 'rgba(0,232,122,0.1)' : 'rgba(255,149,0,0.1)',
                                border: `1px solid ${row.status==='OK' ? 'rgba(0,232,122,0.25)' : 'rgba(255,149,0,0.25)'}`,
                                color: row.status==='OK' ? '#00e87a' : '#ff9500' }} />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.2, px: 1.5, maxWidth: 150 }}>
                            <Tooltip title={row.analysis || ''} arrow>
                              <Typography sx={{ fontSize: '0.68rem', color: 'rgba(160,200,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140, cursor: 'default' }}>{row.analysis || '—'}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.2, px: 1.5, maxWidth: 130 }}>
                            <Tooltip title={row.component_consumption || ''} arrow>
                              <Typography sx={{ fontSize: '0.68rem', color: '#a78bfa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120, cursor: 'default' }}>{row.component_consumption || '—'}</Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell sx={cs}>{row.engg_name || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination component="div" count={data.total || 0} page={page} onPageChange={(e,p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={e => { setRpp(parseInt(e.target.value)); setPage(0) }} rowsPerPageOptions={[10,25,50]}
                  sx={{ color: 'rgba(120,160,210,0.45)', borderTop: '1px solid rgba(255,255,255,0.05)', mt: 0.5, '& .MuiIconButton-root': { color: 'rgba(120,160,210,0.4)' }, '& .MuiSelect-icon': { color: 'rgba(120,160,210,0.4)' }, '& .MuiTablePagination-select': { color: 'rgba(160,200,255,0.6)' } }} />
              </Box>
            </>
          )}
        </Box>
      </Layout>
    </>
  )
}
