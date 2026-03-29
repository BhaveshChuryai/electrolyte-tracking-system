import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { Box, Typography, Button, Grid, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import DeleteIcon from '@mui/icons-material/Delete'
import Layout from '../components/common/Layout'
import axios from 'axios'

const cellStyle = { color: 'rgba(255,255,255,0.65)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.8rem', py: 1.3 }

export default function UploadPage() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [history, setHistory] = useState([])
  const fileInputRef = useRef(null)

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/upload-history')
      setHistory(res.data)
    } catch {}
  }

  useEffect(() => { fetchHistory() }, [])

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    const ext = dropped?.name?.split('.').pop()?.toLowerCase()
    if (dropped && ['xlsx', 'xlsm'].includes(ext)) { setFile(dropped); setUploadStatus(null); setUploadResult(null) }
    else setUploadStatus('invalid')
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files[0]
    const ext = selected?.name?.split('.').pop()?.toLowerCase()
    if (selected && ['xlsx', 'xlsm'].includes(ext)) { setFile(selected); setUploadStatus(null); setUploadResult(null) }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setUploadStatus(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await axios.post('/api/upload', formData, {
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setUploadStatus('success')
      setUploadResult(res.data)
      fetchHistory()
    } catch (err) {
      setUploadStatus('error')
      setUploadResult({ error: err.response?.data?.error || 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => { setFile(null); setUploadStatus(null); setUploadResult(null); setProgress(0) }

  return (
    <>
      <Head><title>Upload Data — Electrolyte Bajaj</title></Head>
      <Layout>
        <Box>
          <Box mb={3}>
            <Typography variant="h5" fontWeight="800" sx={{ background: 'linear-gradient(135deg, #ffffff, #00b4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Upload Data
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
              Upload Bajaj PCB Excel workbook (.xlsm / .xlsx) to populate the dashboard
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* Upload Box */}
            <Grid item xs={12} md={7}>
              <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #0f172a, #1a2744)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography fontWeight="700" fontSize="0.9rem" sx={{ color: 'white', mb: 0.4 }}>Upload Excel Workbook</Typography>
                <Typography fontSize="0.72rem" mb={3} sx={{ color: 'rgba(255,255,255,0.35)' }}>
                  Supported: .xlsx, .xlsm · Max size: 50MB · All PCB sheets will be processed automatically
                </Typography>

                {!file && (
                  <Box onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onClick={() => fileInputRef.current?.click()}
                    sx={{ border: `2px dashed ${dragOver ? '#00b4ff' : 'rgba(255,255,255,0.1)'}`, borderRadius: 3, p: { xs: 4, md: 7 }, textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(0,180,255,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.3s', '&:hover': { border: '2px dashed rgba(0,180,255,0.4)', background: 'rgba(0,180,255,0.03)' } }}>
                    <UploadFileIcon sx={{ fontSize: 52, color: dragOver ? '#00b4ff' : 'rgba(255,255,255,0.2)', mb: 2 }} />
                    <Typography fontWeight="600" sx={{ color: dragOver ? '#00b4ff' : 'rgba(255,255,255,0.5)', mb: 0.5 }}>
                      {dragOver ? '📂 Drop your file here!' : 'Drag & drop your Excel file here'}
                    </Typography>
                    <Typography fontSize="0.72rem" sx={{ color: 'rgba(255,255,255,0.2)', mb: 2.5 }}>or click to browse</Typography>
                    <Button variant="outlined" size="small" sx={{ color: '#00b4ff', borderColor: 'rgba(0,180,255,0.3)', borderRadius: 2, '&:hover': { borderColor: '#00b4ff', background: 'rgba(0,180,255,0.04)' } }}>
                      Choose File
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xlsm" onChange={handleFileSelect} style={{ display: 'none' }} />
                  </Box>
                )}

                {uploadStatus === 'invalid' && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2, background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff4444' }}>
                    Invalid file type. Please upload a .xlsx or .xlsm file.
                  </Alert>
                )}

                {file && (
                  <Box sx={{ p: 2.5, borderRadius: 2, background: 'rgba(0,180,255,0.05)', border: '1px solid rgba(0,180,255,0.2)', mb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <InsertDriveFileIcon sx={{ color: '#00b4ff', fontSize: 28 }} />
                        <Box>
                          <Typography fontWeight="600" fontSize="0.85rem" sx={{ color: 'white' }}>{file.name}</Typography>
                          <Typography fontSize="0.68rem" sx={{ color: 'rgba(255,255,255,0.35)' }}>{(file.size / (1024 * 1024)).toFixed(2)} MB</Typography>
                        </Box>
                      </Box>
                      <Button size="small" onClick={handleRemove} startIcon={<DeleteIcon />} sx={{ color: '#ff4444', '&:hover': { background: 'rgba(255,68,68,0.06)' } }}>Remove</Button>
                    </Box>
                    {uploading && (
                      <Box mt={2}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                          <Typography fontSize="0.7rem" sx={{ color: 'rgba(255,255,255,0.4)' }}>Processing Excel data...</Typography>
                          <Typography fontSize="0.7rem" sx={{ color: '#00b4ff', fontWeight: 700 }}>{progress}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 1, background: 'rgba(255,255,255,0.08)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(135deg, #00b4ff, #0066ff)', borderRadius: 1 } }} />
                      </Box>
                    )}
                  </Box>
                )}

                {uploadStatus === 'success' && uploadResult && (
                  <Box sx={{ p: 2.5, borderRadius: 2, mb: 2, background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <CheckCircleIcon sx={{ color: '#00ff88', mt: 0.2 }} />
                    <Box>
                      <Typography fontWeight="700" fontSize="0.88rem" sx={{ color: '#00ff88', mb: 0.5 }}>Upload Successful! 🎉</Typography>
                      <Typography fontSize="0.75rem" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        {uploadResult.total_rows?.toLocaleString()} records processed across {uploadResult.sheets_processed} PCB sheets
                      </Typography>
                      <Typography fontSize="0.7rem" sx={{ color: 'rgba(255,255,255,0.3)', mt: 0.3 }}>
                        PCBs: {uploadResult.pcb_sheets?.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {uploadStatus === 'error' && (
                  <Box sx={{ p: 2, borderRadius: 2, mb: 2, background: 'rgba(255,68,68,0.05)', border: '1px solid rgba(255,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ErrorIcon sx={{ color: '#ff4444' }} />
                    <Box>
                      <Typography fontWeight="600" fontSize="0.85rem" sx={{ color: '#ff4444' }}>Upload Failed</Typography>
                      <Typography fontSize="0.72rem" sx={{ color: 'rgba(255,255,255,0.4)' }}>{uploadResult?.error || 'Please check the file and try again'}</Typography>
                    </Box>
                  </Box>
                )}

                {file && !uploading && uploadStatus !== 'success' && (
                  <Button fullWidth variant="contained" onClick={handleUpload} startIcon={<UploadFileIcon />}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold', background: 'linear-gradient(135deg, #00b4ff, #0066ff)', boxShadow: '0 8px 25px rgba(0,102,255,0.3)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 30px rgba(0,102,255,0.4)' } }}>
                    Upload & Process Excel
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Instructions */}
            <Grid item xs={12} md={5}>
              <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #0f172a, #1a2744)', border: '1px solid rgba(255,255,255,0.07)', mb: 2 }}>
                <Typography fontWeight="700" fontSize="0.9rem" sx={{ color: 'white', mb: 2 }}>📋 How It Works</Typography>
                {[
                  { step: '1', text: 'Upload the Bajaj PCB Excel file (.xlsm or .xlsx)', color: '#00b4ff' },
                  { step: '2', text: 'System auto-detects all PCB sheets (974290, 971039, etc.)', color: '#00ff88' },
                  { step: '3', text: 'Data is parsed and stored in PostgreSQL database', color: '#ff9500' },
                  { step: '4', text: 'Dashboard updates with real data automatically', color: '#bf5af2' },
                  { step: '5', text: 'Click any PCB code in Master Table for deep analysis', color: '#ff4444' },
                ].map((item, i) => (
                  <Box key={i} display="flex" gap={1.5} mb={1.8} alignItems="flex-start">
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', background: `${item.color}20`, border: `1px solid ${item.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                      <Typography fontSize="0.62rem" fontWeight="800" sx={{ color: item.color }}>{item.step}</Typography>
                    </Box>
                    <Typography fontSize="0.78rem" sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ p: 3, borderRadius: 3, background: 'rgba(0,180,255,0.04)', border: '1px dashed rgba(0,180,255,0.15)' }}>
                <Typography fontWeight="700" fontSize="0.82rem" sx={{ color: '#00b4ff', mb: 1 }}>⚠️ Important Notes</Typography>
                {['Uploading a new file replaces all existing data', 'Sheets: Master_Summary, Dashboard, Pivot are auto-skipped', 'All other sheets are treated as PCB data sheets', 'Maximum file size: 50MB'].map((note, i) => (
                  <Typography key={i} fontSize="0.72rem" sx={{ color: 'rgba(255,255,255,0.35)', mb: 0.5 }}>· {note}</Typography>
                ))}
              </Box>
            </Grid>

            {/* Upload History */}
            <Grid item xs={12}>
              <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #0f172a, #1a2744)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <Typography fontWeight="700" fontSize="0.9rem" sx={{ color: 'white', mb: 2 }}>Upload History</Typography>
                {history.length === 0 ? (
                  <Box textAlign="center" py={3}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No uploads yet</Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: 'rgba(0,0,0,0.25)' }}>
                          {['#', 'Filename', 'Records', 'PCB Sheets', 'Status', 'Date'].map(h => (
                            <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.3)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', py: 1.3 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.map((row, i) => (
                          <TableRow key={row.id} sx={{ '&:hover': { background: 'rgba(0,180,255,0.04)' } }}>
                            <TableCell sx={cellStyle}>{i + 1}</TableCell>
                            <TableCell sx={{ ...cellStyle, color: 'white', fontWeight: 500, fontSize: '0.75rem' }}>{row.original_name}</TableCell>
                            <TableCell sx={{ ...cellStyle, color: '#00b4ff', fontWeight: 600 }}>{row.total_rows?.toLocaleString() || 0}</TableCell>
                            <TableCell sx={{ ...cellStyle, fontSize: '0.7rem', maxWidth: 200 }}>
                              <Typography fontSize="0.7rem" sx={{ color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {row.pcb_sheets?.join(', ') || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', py: 1.3 }}>
                              <Chip label={row.status}
                                icon={row.status === 'success' ? <CheckCircleIcon style={{ fontSize: 13 }} /> : <ErrorIcon style={{ fontSize: 13 }} />}
                                size="small"
                                sx={{ background: row.status === 'success' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${row.status === 'success' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`, color: row.status === 'success' ? '#00ff88' : '#ff4444', fontSize: '0.65rem', fontWeight: 700, height: 20 }} />
                            </TableCell>
                            <TableCell sx={cellStyle}>{new Date(row.uploaded_at).toLocaleDateString('en-IN')} {new Date(row.uploaded_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
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
