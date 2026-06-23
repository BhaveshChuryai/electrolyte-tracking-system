import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { Box, Typography, Button, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, Divider, Tooltip } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import Layout from '../components/common/Layout'

const cs = { color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem', py: 1.2, px: 1.5, fontFamily: 'Inter' }

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [cleaning, setCleaning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [history, setHistory] = useState([])
  const fileInputRef = useRef(null)
  const cleanInputRef = useRef(null)
  const latestUpload = history[0] || null

  useEffect(() => {
    fetch('/api/upload-history').then(r => r.json()).then(d => { if (Array.isArray(d)) setHistory(d) }).catch(() => {})
  }, [uploadStatus])

  const handleFile = (f) => {
    const ext = f?.name?.split('.').pop()?.toLowerCase()
    if (f && ['xlsx', 'xlsm'].includes(ext)) { setFile(f); setUploadStatus(null); setUploadResult(null) }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true); setProgress(0)
    try {
      const fd = new FormData(); fd.append('file', file)
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText)
        if (xhr.status === 200) { setUploadStatus('success'); setUploadResult(res) }
        else { setUploadStatus('error'); setUploadResult({ error: res.error }) }
        setUploading(false)
      }
      xhr.onerror = () => { setUploadStatus('error'); setUploading(false) }
      xhr.open('POST', '/api/upload')
      xhr.send(fd)
    } catch (err) { setUploadStatus('error'); setUploading(false) }
  }

  const handleClean = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setCleaning(true)
    try {
      const fd = new FormData(); fd.append('file', f)
      const res = await fetch('/api/clean-excel', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Cleaning failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'cleaned_pcb_data.xlsx'; a.click()
    } catch (err) { alert('Failed to clean: ' + err.message) }
    finally { setCleaning(false); cleanInputRef.current.value = '' }
  }

  return (
    <>
      <Head><title>Upload Data — Electrolyte Bajaj</title></Head>
      <Layout>
        <Box>
          <Box mb={3}>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px', mb: 0.2, fontFamily: 'Inter' }}>Upload Data</Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#475569', fontFamily: 'Inter' }}>Import Excel workbook to populate the dashboard</Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Upload card */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 2.5, borderRadius: '12px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', mb: 0.3, fontFamily: 'Inter' }}>Upload Excel Workbook</Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#475569', mb: 2.5, fontFamily: 'Inter' }}>Supports old multi-sheet (.xlsm) and new consolidated format (.xlsx) · Max 100MB</Typography>

                {!file && (
                  <Box onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ border: `2px dashed ${dragOver ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', p: 6, textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(59,130,246,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', '&:hover': { border: '2px dashed rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.03)' } }}>
                    <UploadFileIcon sx={{ fontSize: 44, color: dragOver ? '#3b82f6' : '#334155', mb: 1.5 }} />
                    <Typography sx={{ fontWeight: 500, color: '#64748b', mb: 0.5, fontFamily: 'Inter', fontSize: '0.88rem' }}>{dragOver ? 'Drop your file here!' : 'Drag & drop your Excel file here'}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: '#334155', mb: 2, fontFamily: 'Inter' }}>or click to browse</Typography>
                    <Button variant="outlined" size="small" sx={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)', borderRadius: '8px', fontFamily: 'Inter', '&:hover': { borderColor: '#3b82f6' } }}>Choose File</Button>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xlsm" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
                  </Box>
                )}

                {file && (
                  <Box sx={{ p: 2, borderRadius: '9px', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.18)', mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <InsertDriveFileIcon sx={{ color: '#3b82f6', fontSize: 26 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#f1f5f9', fontFamily: 'Inter' }}>{file.name}</Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'Inter' }}>{(file.size / (1024*1024)).toFixed(2)} MB</Typography>
                        </Box>
                      </Box>
                      <Button size="small" onClick={() => { setFile(null); setUploadStatus(null); setProgress(0) }} startIcon={<DeleteIcon />}
                        sx={{ color: '#ef4444', fontFamily: 'Inter', fontSize: '0.72rem', '&:hover': { background: 'rgba(239,68,68,0.07)' } }}>Remove</Button>
                    </Box>
                    {uploading && (
                      <Box mt={1.8}>
                        <Box display="flex" justifyContent="space-between" mb={0.4}>
                          <Typography sx={{ fontSize: '0.68rem', color: '#64748b', fontFamily: 'Inter' }}>Processing...</Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 600, fontFamily: "'JetBrains Mono'" }}>{progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, height: 4, background: 'rgba(255,255,255,0.07)', '& .MuiLinearProgress-bar': { background: '#3b82f6', borderRadius: 1 } }} />
                      </Box>
                    )}
                  </Box>
                )}

                {uploadStatus === 'success' && uploadResult && (
                  <Box sx={{ p: 2, borderRadius: '9px', mb: 2, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.18)' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.8}>
                      <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#22c55e', fontFamily: 'Inter' }}>Upload Successful!</Typography>
                    </Box>
                    <Box display="flex" gap={1.5} flexWrap="wrap">
                      {[
                        { l: 'Total', v: uploadResult.total_rows, c: '#3b82f6' },
                        { l: 'OK', v: uploadResult.ok_rows, c: '#22c55e' },
                        { l: 'NFF', v: uploadResult.nff_rows, c: '#f59e0b' },
                        { l: 'WIP', v: uploadResult.wip_rows, c: '#eab308' },
                        { l: 'Format', v: uploadResult.format?.toUpperCase(), c: '#8b5cf6' },
                      ].map(x => (
                        <Box key={x.l} sx={{ textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: x.c, fontFamily: "'JetBrains Mono'" }}>{x.v?.toLocaleString()}</Typography>
                          <Typography sx={{ fontSize: '0.58rem', color: '#475569', fontFamily: 'Inter' }}>{x.l}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {uploadStatus === 'error' && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: '9px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '0.78rem', fontFamily: 'Inter' }}>
                    {uploadResult?.error || 'Upload failed. Please check the file format.'}
                  </Alert>
                )}

                {file && !uploading && uploadStatus !== 'success' && (
                  <Button fullWidth variant="contained" onClick={handleUpload} startIcon={<UploadFileIcon />}
                    sx={{ py: 1.3, borderRadius: '9px', fontWeight: 600, background: '#3b82f6', fontFamily: 'Inter', '&:hover': { background: '#2563eb' } }}>
                    Upload & Process
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Right side */}
            <Grid item xs={12} md={5}>
              {latestUpload && (
                <Box sx={{ p: 2.5, borderRadius: '12px', background: '#111827', border: '1px solid rgba(34,197,94,0.18)', mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9', mb: 0.3, fontFamily: 'Inter' }}>Last Upload Summary</Typography>
                  <Typography sx={{ fontSize: '0.66rem', color: '#64748b', mb: 1.7, fontFamily: 'Inter' }}>
                    {latestUpload.original_name} on {new Date(latestUpload.uploaded_at).toLocaleDateString('en-IN')} {new Date(latestUpload.uploaded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      { label: 'Auto-fixed', value: Number(latestUpload.auto_fixed || 0) + Number(latestUpload.fuzzy_fixed || 0), color: '#22c55e' },
                      { label: 'Flagged', value: latestUpload.flagged || 0, color: '#f59e0b' },
                      { label: 'OK', value: latestUpload.ok_rows || 0, color: '#3b82f6' },
                      { label: 'WIP', value: latestUpload.wip_rows || 0, color: '#8b5cf6' },
                    ].map((item) => (
                      <Grid item xs={6} key={item.label}>
                        <Box sx={{ p: 1.2, borderRadius: '9px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <Typography sx={{ color: item.color, fontWeight: 800, fontSize: '0.95rem', fontFamily: "'JetBrains Mono'" }}>{Number(item.value).toLocaleString()}</Typography>
                          <Typography sx={{ color: '#64748b', fontSize: '0.62rem', mt: 0.25, fontFamily: 'Inter' }}>{item.label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {/* Excel Cleaner */}
              <Box sx={{ p: 2.5, borderRadius: '12px', background: '#111827', border: '1px solid rgba(139,92,246,0.2)', mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <AutoFixHighIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#f1f5f9', fontFamily: 'Inter' }}>Excel Data Cleaner</Typography>
                  <Box sx={{ px: 0.7, py: 0.2, borderRadius: '5px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <Typography sx={{ fontSize: '0.55rem', color: '#8b5cf6', fontWeight: 700, fontFamily: 'Inter' }}>NEW</Typography>
                  </Box>
                </Box>
                <Typography sx={{ fontSize: '0.68rem', color: '#475569', mb: 2, fontFamily: 'Inter', lineHeight: 1.6 }}>
                  Automatically fixes all data quality issues in your Excel file before uploading:
                </Typography>
                {[
                  '"NULL" strings → empty cells',
                  'Branch name variants → canonical names',
                  'Status → OK / NFF / WIP',
                  'Defect spelling fixes (Dead, Not Working)',
                  'Adds cleaned columns alongside original',
                  'Exports Issues Log sheet',
                ].map((t, i) => (
                  <Box key={i} display="flex" alignItems="center" gap={0.8} mb={0.6}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: '#8b5cf6', flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', fontFamily: 'Inter' }}>{t}</Typography>
                  </Box>
                ))}
                <Button fullWidth variant="outlined" startIcon={cleaning ? null : <DownloadIcon />}
                  onClick={() => cleanInputRef.current?.click()}
                  disabled={cleaning}
                  sx={{ mt: 2, py: 1.1, borderRadius: '9px', color: '#8b5cf6', borderColor: 'rgba(139,92,246,0.3)', fontFamily: 'Inter', fontWeight: 600, '&:hover': { borderColor: '#8b5cf6', background: 'rgba(139,92,246,0.06)' } }}>
                  {cleaning ? 'Cleaning...' : 'Clean & Download Excel'}
                </Button>
                <input ref={cleanInputRef} type="file" accept=".xlsx,.xlsm" onChange={handleClean} style={{ display: 'none' }} />
              </Box>

              {/* Instructions */}
              <Box sx={{ p: 2.5, borderRadius: '12px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#f1f5f9', mb: 1.5, fontFamily: 'Inter' }}>📋 Supported Formats</Typography>
                {[
                  { label: 'New Format', desc: 'Single sheet "Bajaj_consolidated_data" — DB column names', color: '#22c55e' },
                  { label: 'Old Format', desc: 'Multiple sheets per PCB code (974290, 971039, etc.)', color: '#3b82f6' },
                ].map(x => (
                  <Box key={x.label} sx={{ p: 1.5, borderRadius: '8px', background: `${x.color}08`, border: `1px solid ${x.color}18`, mb: 1 }}>
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: x.color, mb: 0.2, fontFamily: 'Inter' }}>{x.label}</Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'Inter' }}>{x.desc}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* History */}
            <Grid item xs={12}>
              <Box sx={{ p: 2.5, borderRadius: '12px', background: '#111827', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', mb: 2, fontFamily: 'Inter' }}>Upload History</Typography>
                {history.length === 0 ? (
                  <Box textAlign="center" py={3}><Typography sx={{ color: '#334155', fontSize: '0.78rem', fontFamily: 'Inter' }}>No uploads yet</Typography></Box>
                ) : (
                  <TableContainer sx={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(0,0,0,0.25)' }}>
                          {['#','Filename','Total','OK','NFF','WIP','Status','Date'].map(h => (
                            <TableCell key={h} sx={{ color: '#334155', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', py: 1.2, px: 1.5, fontFamily: 'Inter' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((row, i) => (
                          <TableRow key={row.id} sx={{ '&:hover': { background: 'rgba(59,130,246,0.04)' } }}>
                            <TableCell sx={cs}>{i + 1}</TableCell>
                            <TableCell sx={{ ...cs, color: '#f1f5f9', fontWeight: 500 }}>{row.original_name}</TableCell>
                            <TableCell sx={{ ...cs, color: '#3b82f6', fontFamily: "'JetBrains Mono'" }}>{row.total_rows?.toLocaleString()}</TableCell>
                            <TableCell sx={{ ...cs, color: '#22c55e', fontFamily: "'JetBrains Mono'" }}>{row.ok_rows || 0}</TableCell>
                            <TableCell sx={{ ...cs, color: '#f59e0b', fontFamily: "'JetBrains Mono'" }}>{row.nff_rows || 0}</TableCell>
                            <TableCell sx={{ ...cs, color: '#eab308', fontFamily: "'JetBrains Mono'" }}>{row.wip_rows || 0}</TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.2, px: 1.5 }}>
                              <Chip label={row.status} size="small"
                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, fontFamily: 'Inter',
                                  background: row.status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                  border: `1px solid ${row.status === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                                  color: row.status === 'success' ? '#22c55e' : '#ef4444' }} />
                            </TableCell>
                            <TableCell sx={{ ...cs, fontSize: '0.7rem' }}>{new Date(row.uploaded_at).toLocaleDateString('en-IN')} {new Date(row.uploaded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  )
}
