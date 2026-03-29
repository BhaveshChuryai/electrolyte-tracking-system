import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Box, Typography, Grid, Chip, CircularProgress, Alert } from '@mui/material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/common/Layout'
import IndiaMap from '../components/map/IndiaMap'

const TT = {
  contentStyle: { background: '#0a1628', border: '1px solid rgba(0,180,255,0.2)', borderRadius: '10px', color: '#eaf3ff', fontSize: '0.75rem', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', padding: '10px 14px' },
  formatter: (val, name) => {
    const c = name === 'OK' ? '#00e87a' : '#ff9500'
    return [<span style={{ color: c, fontWeight: 700 }}>{Number(val).toLocaleString()}</span>, name]
  }
}

export default function MapAnalyticsPage() {
  const [stateData, setStateData] = useState([])
  const [cityData, setCityData] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [cityLoading, setCityLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalMapped, setTotalMapped] = useState(0)

  useEffect(() => {
    fetch('/api/map-data')
      .then(r => r.json())
      .then(d => {
        if (d.error) { setError(d.error); return }
        setStateData(Array.isArray(d.states) ? d.states : [])
        setTotalMapped(d.total_mapped || 0)
      })
      .catch(() => setError('Failed to load map data'))
      .finally(() => setMapLoading(false))
  }, [])

  const handleStateClick = async (stateName) => {
    setSelectedState(stateName)
    setCityLoading(true)
    setCityData(null)
    try {
      const r = await fetch(`/api/map-data?state=${encodeURIComponent(stateName)}`)
      const d = await r.json()
      setCityData(d)
    } catch { setCityData({ cities: [] }) }
    finally { setCityLoading(false) }
  }

  const handleBack = () => { setSelectedState(null); setCityData(null) }

  const chartData = selectedState && cityData?.cities
    ? cityData.cities.slice(0, 10).map(c => ({ name: c.city, ok: c.ok, nff: c.nff }))
    : stateData.slice(0, 10).map(s => ({ name: s.state.length > 8 ? s.state.slice(0, 8) + '…' : s.state, ok: s.ok, nff: s.nff }))

  return (
    <>
      <Head><title>Map Analytics — Electrolyte Bajaj</title></Head>
      <Layout>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
            <Box>
              <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#eaf3ff', letterSpacing: '-0.5px', mb: 0.3 }}>Map Analytics</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(120,160,210,0.45)' }}>Geographic PCB repair distribution across India</Typography>
            </Box>
            <Box display="flex" gap={1.5}>
              <Chip label={`${stateData.length} States`} size="small" sx={{ background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.2)', color: '#00b4ff', fontSize: '0.62rem', height: 22 }} />
              <Chip label={`${totalMapped.toLocaleString()} Mapped`} size="small" sx={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.18)', color: '#00e87a', fontSize: '0.62rem', height: 22 }} />
            </Box>
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '12px', background: 'rgba(255,149,0,0.07)', border: '1px solid rgba(255,149,0,0.18)', color: '#ff9500', fontSize: '0.8rem' }}>
              {stateData.length === 0 ? 'No mapped data. Upload Excel file first to see the India heatmap.' : error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Map */}
            <Grid item xs={12} lg={7}>
              <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)', minHeight: 580 }}>
                <IndiaMap
                  stateData={stateData}
                  cityData={cityData}
                  selectedState={selectedState}
                  onStateClick={handleStateClick}
                  onBack={handleBack}
                  loading={mapLoading || cityLoading}
                />
              </Box>
            </Grid>

            {/* Right side */}
            <Grid item xs={12} lg={5}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                {/* Summary cards */}
                <Grid container spacing={1.5}>
                  {[
                    { l: 'States Covered', v: stateData.length, c: '#00b4ff' },
                    { l: 'PCBs Mapped', v: totalMapped.toLocaleString(), c: '#00e87a' },
                    { l: 'Top State', v: stateData[0]?.state?.split(' ').slice(0,2).join(' ') || '—', c: '#a78bfa' },
                    { l: 'Max Volume', v: stateData[0]?.total?.toLocaleString() || '0', c: '#ff9500' },
                  ].map((card, i) => (
                    <Grid item xs={6} key={i}>
                      <Box sx={{ p: 1.8, borderRadius: '12px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: card.c, fontFamily: "'DM Mono', monospace", mb: 0.2, lineHeight: 1.2 }}>{card.v}</Typography>
                        <Typography sx={{ fontSize: '0.63rem', color: 'rgba(120,160,210,0.4)' }}>{card.l}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Bar chart */}
                <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff', mb: 0.2 }}>
                    {selectedState ? `${selectedState} Cities` : 'Top States'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.63rem', color: 'rgba(120,160,210,0.4)', mb: 2 }}>PCB count breakdown</Typography>
                  {mapLoading || cityLoading ? (
                    <Box display="flex" justifyContent="center" py={5}><CircularProgress sx={{ color: '#00b4ff' }} size={28} /></Box>
                  ) : chartData.length === 0 ? (
                    <Box textAlign="center" py={4}><Typography sx={{ color: 'rgba(120,160,210,0.25)', fontSize: '0.75rem' }}>No data available</Typography></Box>
                  ) : (
                    <ResponsiveContainer width="100%" height={270}>
                      <BarChart data={chartData} layout="vertical" barSize={13} margin={{ left: 10, right: 20, top: 4, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: 'rgba(160,200,255,0.55)', fontSize: 10, fontFamily: "'DM Mono',monospace" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: 'rgba(160,200,255,0.6)', fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip {...TT} />
                        <Bar dataKey="ok" name="OK" stackId="a" fill="#00e87a" animationDuration={800} />
                        <Bar dataKey="nff" name="NFF" stackId="a" fill="#ff9500" radius={[0, 4, 4, 0]} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Box>

                {/* State ranking list */}
                {!selectedState && stateData.length > 0 && (
                  <Box sx={{ p: 2.5, borderRadius: '14px', background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#eaf3ff', mb: 1.5 }}>State Rankings</Typography>
                    <Box sx={{ maxHeight: 210, overflowY: 'auto', pr: 0.5 }}>
                      {stateData.map((st, i) => {
                        const r = parseFloat(st.ok_rate || 0)
                        const rc = r >= 75 ? '#00e87a' : r >= 50 ? '#ff9500' : '#ff4d4d'
                        return (
                          <Box key={st.state} onClick={() => handleStateClick(st.state)}
                            display="flex" alignItems="center" justifyContent="space-between"
                            sx={{ py: 0.9, px: 1, borderRadius: '8px', mb: 0.3, cursor: 'pointer', transition: 'all 0.15s', '&:hover': { background: 'rgba(0,180,255,0.06)', transform: 'translateX(4px)' } }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography sx={{ fontSize: '0.6rem', color: 'rgba(100,140,190,0.3)', fontFamily: "'DM Mono',monospace", minWidth: 18 }}>{String(i+1).padStart(2,'0')}</Typography>
                              <Typography sx={{ fontSize: '0.75rem', color: '#eaf3ff', fontWeight: 500 }}>{st.state}</Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#00b4ff', fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{st.total.toLocaleString()}</Typography>
                              <Chip label={`${r}%`} size="small" sx={{ height: 17, fontSize: '0.57rem', fontWeight: 700, background: `${rc}12`, color: rc, border: `1px solid ${rc}22` }} />
                            </Box>
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    </>
  )
}
