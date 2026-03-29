import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Typography, Grid, CircularProgress, Alert, LinearProgress, IconButton, Tooltip, TextField, InputAdornment, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import VisibilityIcon from '@mui/icons-material/Visibility'
import TableChartIcon from '@mui/icons-material/TableChart'
import Layout from '../components/common/Layout'
import axios from 'axios'

const cellStyle = { color: 'rgba(255,255,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', py: 1.3 }

export default function MasterTablePage() {
  const router = useRouter()
  const [pcbList, setPcbList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    axios.get('/api/pcb-list')
      .then(res => setPcbList(res.data))
      .catch(() => setError('Failed to load PCB list'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = pcbList.filter(r =>
    search === '' || String(r.part_code).includes(search) ||
    (r.product_description || '').toLowerCase().includes(search.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  const totalEntries = pcbList.reduce((sum, r) => sum + (r.total_entries || 0), 0)

  const handleExport = () => {
    const csv = ['Part Code,Product,Total,OK,NFF,OK Rate%,Branches', ...pcbList.map(r => `${r.part_code},"${r.product_description || ''}",${r.total_entries},${r.ok_count || 0},${r.nff_count || 0},${r.ok_rate || 0},${r.branch_count || 0}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'pcb_master_table.csv'
    a.click()
  }

  const getOKRateColor = (rate) => {
    const r = parseFloat(rate || 0)
    if (r >= 80) return '#00ff88'
    if (r >= 60) return '#ff9500'
    return '#ff4444'
  }

  return (
    <>
      <Head><title>Master Table — Electrolyte Bajaj</title></Head>
      <Layout>
        <Box>
          <Box mb={3}>
            <Typography variant="h5" fontWeight="800" sx={{ background: 'linear-gradient(135deg, #ffffff, #00b4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Master Table</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
              All PCB codes with repair summary · Click any row for detailed analysis
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          {/* Summary Cards */}
          <Grid container spacing={2} mb={3}>
            {[
              { label: 'Total PCB Types', value: pcbList.length, color: '#00b4ff' },
              { label: 'Total Records', value: totalEntries.toLocaleString(), color: '#00ff88' },
              { label: 'Avg per PCB', value: pcbList.length ? Math.round(totalEntries / pcbList.length).toLocaleString() : 0, color: '#ff9500' },
              { label: 'Active Branches', value: [...new Set(pcbList.flatMap(p => []))].length || '—', color: '#bf5af2' },
            ].map((card, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, #0f172a, #1a2744)', border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-3px)', border: `1px solid ${card.color}25` } }}>
                  <Typography variant="h5" fontWeight="900" sx={{ color: card.color, mb: 0.3 }}>{card.value}</Typography>
                  <Typography fontSize="0.75rem" sx={{ color: 'rgba(255,255,255,0.4)' }}>{card.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* Table */}
          <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #0f172a, #1a2744)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <TableChartIcon sx={{ color: '#00b4ff', fontSize: 20 }} />
                <Box>
                  <Typography fontWeight="700" fontSize="0.9rem" sx={{ color: 'white' }}>Master Summary</Typography>
                  <Typography fontSize="0.68rem" sx={{ color: 'rgba(255,255,255,0.35)' }}>{filtered.length} PCB types total</Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1.5} alignItems="center">
                <TextField size="small" placeholder="Search part code..." value={search} onChange={(e) => setSearch(e.target.value)}
                  sx={{ width: 200, '& .MuiOutlinedInput-root': { color: 'white', borderRadius: 2, background: 'rgba(255,255,255,0.05)', fontSize: '0.82rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }, '&:hover fieldset': { borderColor: '#00b4ff' }, '&.Mui-focused fieldset': { borderColor: '#00b4ff' } }, '& input::placeholder': { color: 'rgba(255,255,255,0.25)', opacity: 1 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }} /></InputAdornment> }} />
                <Tooltip title="Export CSV">
                  <IconButton onClick={handleExport} size="small" sx={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, '&:hover': { color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' } }}>
                    <FileDownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={5}><CircularProgress sx={{ color: '#00b4ff' }} /></Box>
            ) : filtered.length === 0 ? (
              <Box textAlign="center" py={5}>
                <Typography fontSize="1.8rem" mb={1}>📋</Typography>
                <Typography fontWeight="600" sx={{ color: 'rgba(255,255,255,0.3)' }}>No PCB data found</Typography>
                <Typography fontSize="0.78rem" sx={{ color: 'rgba(255,255,255,0.2)' }}>Upload an Excel file to populate data</Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: 'rgba(0,0,0,0.25)' }}>
                        {['#', 'Part Code', 'Product Description', 'DC No', 'Total', 'OK', 'NFF', 'OK Rate', 'Branches', 'Action'].map(h => (
                          <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', py: 1.3, whiteSpace: 'nowrap' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginated.map((row, i) => {
                        const okRate = parseFloat(row.ok_rate || 0)
                        const rateColor = getOKRateColor(okRate)
                        return (
                          <TableRow key={row.part_code} onClick={() => router.push(`/master-table/${row.part_code}`)}
                            sx={{ '&:hover': { background: 'rgba(0,180,255,0.06)', cursor: 'pointer' }, transition: 'background 0.15s', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                            <TableCell sx={cellStyle}>{page * rowsPerPage + i + 1}</TableCell>
                            <TableCell sx={{ ...cellStyle, color: '#00b4ff', fontWeight: 700, fontSize: '0.88rem' }}>{row.part_code}</TableCell>
                            <TableCell sx={{ ...cellStyle, maxWidth: 200 }}>
                              <Typography fontSize="0.72rem" sx={{ color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {row.product_description || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ ...cellStyle, fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{row.dc_no || '—'}</TableCell>
                            <TableCell sx={{ ...cellStyle, color: 'white', fontWeight: 600 }}>{row.total_entries?.toLocaleString()}</TableCell>
                            <TableCell sx={{ ...cellStyle, color: '#00ff88', fontWeight: 600 }}>{row.ok_count || 0}</TableCell>
                            <TableCell sx={{ ...cellStyle, color: '#ff9500', fontWeight: 600 }}>{row.nff_count || 0}</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.3, minWidth: 110 }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <LinearProgress variant="determinate" value={okRate} sx={{ flexGrow: 1, height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { background: rateColor, borderRadius: 2 } }} />
                                <Typography fontSize="0.68rem" sx={{ color: rateColor, fontWeight: 700, minWidth: 38 }}>{okRate}%</Typography>
                              </Box>
                            </TableCell>
                            <TableCell sx={cellStyle}>{row.branch_count || 0}</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.3 }}>
                              <Tooltip title="View Detailed Analysis">
                                <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#00b4ff', background: 'rgba(0,180,255,0.08)' } }}>
                                  <VisibilityIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0) }} rowsPerPageOptions={[10, 25, 50]}
                  sx={{ color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)', '& .MuiIconButton-root': { color: 'rgba(255,255,255,0.4)' }, '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.4)' }, '& .MuiTablePagination-select': { color: 'rgba(255,255,255,0.6)' } }} />
              </>
            )}
          </Box>
        </Box>
      </Layout>
    </>
  )
}
