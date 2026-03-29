import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, TablePagination, IconButton, Tooltip, TextField, InputAdornment, LinearProgress, Skeleton } from '@mui/material'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useState } from 'react'
import { useRouter } from 'next/router'

const cs = { color: 'rgba(160,200,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem', py: 1.3, px: 1.5 }

export default function DataTable({ rows = [], search, onSearchChange, loading }) {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rpp, setRpp] = useState(8)

  const filtered = rows.filter(r => search === '' || String(r.part_code).includes(search) || (r.product_description || '').toLowerCase().includes(search.toLowerCase()))
  const paginated = filtered.slice(page * rpp, page * rpp + rpp)

  const handleExport = () => {
    const csv = ['Part Code,Product,Total,OK,NFF,OK Rate%,Branches', ...rows.map(r => `${r.part_code},"${r.product_description||''}",${r.total_entries},${r.ok_count||0},${r.nff_count||0},${r.ok_rate||0},${r.branch_count||0}`)].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'pcb_master.csv'; a.click()
  }

  const rateColor = (r) => { const v = parseFloat(r||0); return v>=80?'#00e87a':v>=60?'#ff9500':'#ff4d4d' }

  if (loading) return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: '#0d1626', border: '1px solid rgba(255,255,255,0.05)', mb: 3 }}>
      <Skeleton variant="text" width="40%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.06)', mb: 2 }} />
      {[...Array(5)].map((_,i) => <Skeleton key={i} variant="rounded" height={44} sx={{ bgcolor: 'rgba(255,255,255,0.04)', mb: 0.8, borderRadius: '8px' }} />)}
    </Box>
  )

  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.2}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#eaf3ff' }}>PCB Master Summary</Typography>
          <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.4)' }}>
            {filtered.length} PCB types · Click any row for detailed analysis
          </Typography>
        </Box>
        <Box display="flex" gap={1} alignItems="center">
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => onSearchChange(e.target.value)}
            sx={{ width: 170, '& .MuiOutlinedInput-root': { color: '#eaf3ff', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', fontSize: '0.78rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.07)' }, '&:hover fieldset': { borderColor: 'rgba(0,180,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: '#00b4ff' } }, '& input::placeholder': { color: 'rgba(120,160,210,0.3)', opacity: 1 } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(120,160,210,0.35)', fontSize: 15 }} /></InputAdornment> }} />
          <Tooltip title="Export CSV">
            <IconButton onClick={handleExport} size="small" sx={{ color: 'rgba(120,160,210,0.4)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '9px', p: 0.7, '&:hover': { color: '#00e87a', border: '1px solid rgba(0,232,122,0.25)', background: 'rgba(0,232,122,0.06)' } }}>
              <FileDownloadOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography sx={{ fontSize: '2rem', mb: 1, opacity: 0.2 }}>📋</Typography>
          <Typography sx={{ fontWeight: 600, color: 'rgba(120,160,210,0.3)', fontSize: '0.85rem' }}>No PCB data yet</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(100,140,190,0.25)', mt: 0.5 }}>Upload an Excel file to populate the dashboard</Typography>
        </Box>
      ) : (
        <>
          <TableContainer sx={{ borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ background: 'rgba(0,0,0,0.3)' }}>
                  {['#','Part Code','Product','Total','OK','NFF','OK Rate','Branches','View'].map(h => (
                    <TableCell key={h} sx={{ color: 'rgba(100,140,190,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', py: 1.3, px: 1.5, whiteSpace: 'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((row, i) => {
                  const rc = rateColor(row.ok_rate)
                  const rate = parseFloat(row.ok_rate || 0)
                  return (
                    <TableRow key={row.part_code} onClick={() => router.push(`/master-table/${row.part_code}`)}
                      sx={{ cursor: 'pointer', transition: 'background 0.15s', '&:hover': { background: 'rgba(0,180,255,0.05)' }, background: i%2===0?'transparent':'rgba(255,255,255,0.01)', animation: `fadeIn 0.3s ease ${i*0.04}s both`, '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
                      <TableCell sx={cs}>{page*rpp+i+1}</TableCell>
                      <TableCell sx={{ ...cs, color: '#00b4ff', fontWeight: 700, fontSize: '0.85rem', fontFamily: "'DM Mono', monospace" }}>{row.part_code}</TableCell>
                      <TableCell sx={{ ...cs, maxWidth: 200 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(160,200,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.product_description || '—'}</Typography>
                      </TableCell>
                      <TableCell sx={{ ...cs, color: '#eaf3ff', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{row.total_entries?.toLocaleString()}</TableCell>
                      <TableCell sx={{ ...cs, color: '#00e87a', fontWeight: 600 }}>{row.ok_count||0}</TableCell>
                      <TableCell sx={{ ...cs, color: '#ff9500', fontWeight: 600 }}>{row.nff_count||0}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.3, px: 1.5, minWidth: 105 }}>
                        <Box display="flex" alignItems="center" gap={0.8}>
                          <LinearProgress variant="determinate" value={rate} sx={{ flexGrow: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)', '& .MuiLinearProgress-bar': { background: rc, borderRadius: 2, transition: 'transform 1s ease' } }} />
                          <Typography sx={{ fontSize: '0.68rem', color: rc, fontWeight: 700, minWidth: 36, fontFamily: "'DM Mono', monospace" }}>{rate}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={cs}>{row.branch_count||0}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.3, px: 1.5 }}>
                        <Tooltip title="View Analysis">
                          <IconButton size="small" sx={{ color: 'rgba(120,160,210,0.3)', p: 0.5, '&:hover': { color: '#00b4ff', background: 'rgba(0,180,255,0.1)' } }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e,p) => setPage(p)} rowsPerPage={rpp} onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value)); setPage(0) }} rowsPerPageOptions={[8,15,25]}
            sx={{ color: 'rgba(120,160,210,0.45)', borderTop: '1px solid rgba(255,255,255,0.05)', mt: 0.5, fontSize: '0.75rem', '& .MuiIconButton-root': { color: 'rgba(120,160,210,0.4)' }, '& .MuiSelect-icon': { color: 'rgba(120,160,210,0.4)' }, '& .MuiTablePagination-select': { color: 'rgba(160,200,255,0.6)' } }} />
        </>
      )}
    </Box>
  )
}
