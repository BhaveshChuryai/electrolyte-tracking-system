import { useState, useCallback } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LocationOnIcon from '@mui/icons-material/LocationOn'

// Proper India map state paths using accurate geographic proportions
// viewBox: 0 0 800 900
const INDIA_STATES = [
  { id:'Jammu & Kashmir',    ab:'J&K',   d:'M295,30 L370,22 L410,35 L420,58 L405,75 L375,82 L338,78 L310,65 L292,48Z' },
  { id:'Himachal Pradesh',   ab:'HP',    d:'M338,78 L390,74 L402,95 L388,112 L362,116 L344,102Z' },
  { id:'Punjab',             ab:'PB',    d:'M295,72 L340,78 L346,102 L326,115 L302,108 L290,90Z' },
  { id:'Uttarakhand',        ab:'UK',    d:'M388,112 L432,105 L445,128 L425,140 L398,138Z' },
  { id:'Haryana',            ab:'HR',    d:'M320,112 L360,108 L368,130 L346,140 L322,132Z' },
  { id:'Delhi',              ab:'DL',    d:'M354,128 L368,126 L372,140 L358,143Z' },
  { id:'Rajasthan',          ab:'RJ',    d:'M195,120 L320,118 L335,145 L330,215 L290,245 L240,255 L185,238 L162,205 L158,168Z' },
  { id:'Uttar Pradesh',      ab:'UP',    d:'M368,128 L445,122 L488,138 L502,162 L492,198 L448,218 L392,225 L348,218 L335,195 L340,162 L352,142Z' },
  { id:'Bihar',              ab:'BR',    d:'M492,158 L545,152 L562,170 L556,198 L522,212 L492,205Z' },
  { id:'Sikkim',             ab:'SK',    d:'M568,145 L585,142 L589,158 L575,162Z' },
  { id:'West Bengal',        ab:'WB',    d:'M556,172 L592,162 L612,185 L608,228 L588,252 L565,258 L548,238 L542,212Z' },
  { id:'Jharkhand',          ab:'JH',    d:'M492,208 L548,205 L558,235 L540,265 L505,272 L478,258 L472,232Z' },
  { id:'Odisha',             ab:'OD',    d:'M508,272 L565,262 L588,288 L580,332 L555,352 L520,358 L495,335 L488,305Z' },
  { id:'Chhattisgarh',       ab:'CG',    d:'M375,235 L492,228 L505,262 L498,308 L462,328 L418,332 L388,312 L372,278Z' },
  { id:'Madhya Pradesh',     ab:'MP',    d:'M238,252 L388,248 L392,282 L375,310 L330,328 L272,332 L228,318 L210,290 L215,262Z' },
  { id:'Gujarat',            ab:'GJ',    d:'M105,215 L200,208 L218,245 L225,295 L205,335 L175,355 L135,360 L98,340 L78,305 L75,265 L90,235Z' },
  { id:'Maharashtra',        ab:'MH',    d:'M185,335 L335,332 L348,368 L330,415 L295,442 L248,450 L205,438 L168,412 L152,378 L162,352Z' },
  { id:'Goa',                ab:'GA',    d:'M188,445 L208,440 L215,458 L196,462Z' },
  { id:'Karnataka',          ab:'KA',    d:'M162,415 L298,445 L315,482 L302,530 L268,558 L225,565 L185,548 L155,515 L145,478Z' },
  { id:'Andhra Pradesh',     ab:'AP',    d:'M342,378 L502,358 L525,395 L510,445 L470,478 L422,488 L375,472 L338,442 L325,408Z' },
  { id:'Telangana',          ab:'TS',    d:'M335,332 L498,312 L515,358 L470,380 L385,385 L342,368Z' },
  { id:'Tamil Nadu',         ab:'TN',    d:'M270,562 L385,548 L418,578 L405,632 L375,665 L330,672 L285,652 L252,618 L248,585Z' },
  { id:'Kerala',             ab:'KL',    d:'M190,555 L265,568 L278,612 L262,660 L228,675 L195,655 L175,620 L170,582Z' },
  { id:'Assam',              ab:'AS',    d:'M598,162 L658,155 L675,175 L648,195 L605,200 L588,182Z' },
  { id:'Arunachal Pradesh',  ab:'AR',    d:'M600,118 L682,112 L700,135 L672,155 L618,158 L598,140Z' },
  { id:'Nagaland',           ab:'NL',    d:'M668,168 L695,162 L700,182 L678,188 L665,178Z' },
  { id:'Manipur',            ab:'MN',    d:'M678,192 L700,185 L708,208 L688,215 L674,205Z' },
  { id:'Mizoram',            ab:'MZ',    d:'M665,218 L688,212 L695,235 L672,240 L658,230Z' },
  { id:'Meghalaya',          ab:'ML',    d:'M598,198 L642,192 L652,212 L622,220 L595,212Z' },
  { id:'Tripura',            ab:'TR',    d:'M645,218 L665,214 L668,232 L648,236 L640,225Z' },
]

const getStateColor = (total, max, okRate) => {
  if (!total || total === 0) return { fill: 'rgba(255,255,255,0.04)', stroke: 'rgba(0,180,255,0.1)' }
  const t = Math.min(total / max, 1)
  const r = parseFloat(okRate || 0)
  if (r >= 75) {
    const g = Math.round(130 + t * 122), b = Math.round(80 + t * 42)
    return { fill: `rgba(0,${g},${b},${0.3 + t * 0.5})`, stroke: `rgba(0,232,122,${0.3 + t * 0.4})` }
  } else if (r >= 50) {
    const rr = Math.round(180 + t * 75), gg = Math.round(100 + t * 49)
    return { fill: `rgba(${rr},${gg},0,${0.3 + t * 0.5})`, stroke: `rgba(255,149,0,${0.3 + t * 0.4})` }
  } else {
    const rr = Math.round(150 + t * 105)
    return { fill: `rgba(${rr},40,40,${0.3 + t * 0.5})`, stroke: `rgba(255,77,77,${0.3 + t * 0.4})` }
  }
}

export default function IndiaMap({ stateData = [], cityData = null, selectedState = null, onStateClick, onBack, loading }) {
  const [hovered, setHovered] = useState(null)
  const [tip, setTip] = useState({ x: 0, y: 0 })

  const stateMap = {}
  stateData.forEach(s => { stateMap[s.state] = s })
  const maxTotal = stateData.length > 0 ? Math.max(...stateData.map(s => s.total), 1) : 1

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height={480} flexDirection="column" gap={2}>
      <CircularProgress sx={{ color: '#00b4ff' }} size={32} />
      <Typography sx={{ color: 'rgba(120,160,210,0.4)', fontSize: '0.75rem' }}>Loading map data...</Typography>
    </Box>
  )

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header bar */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          {selectedState && (
            <Box onClick={onBack} sx={{
              display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
              px: 1.2, py: 0.4, borderRadius: '7px',
              border: '1px solid rgba(0,180,255,0.22)', color: '#00b4ff',
              fontSize: '0.72rem', fontWeight: 600, transition: 'all 0.2s',
              '&:hover': { background: 'rgba(0,180,255,0.08)' }
            }}>
              <ArrowBackIcon sx={{ fontSize: 13 }} /> Back to India
            </Box>
          )}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#eaf3ff' }}>
              {selectedState ? `${selectedState} — Cities` : 'India PCB Heatmap'}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', color: 'rgba(120,160,210,0.4)' }}>
              {selectedState ? 'PCB counts by service city' : 'Hover state for details · click to drill into cities'}
            </Typography>
          </Box>
        </Box>
        {/* Legend */}
        <Box display="flex" gap={1.2} alignItems="center">
          {[['rgba(0,210,120,0.7)','≥75% OK'],['rgba(220,140,0,0.7)','50–74%'],['rgba(200,60,60,0.7)','<50%'],['rgba(255,255,255,0.07)','No data']].map(([c,l]) => (
            <Box key={l} display="flex" alignItems="center" gap={0.4}>
              <Box sx={{ width: 9, height: 9, borderRadius: '2px', background: c }} />
              <Typography sx={{ fontSize: '0.58rem', color: 'rgba(120,160,210,0.5)' }}>{l}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {!selectedState ? (
        /* ── INDIA MAP SVG ── */
        <Box sx={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%, rgba(0,60,120,0.15) 0%, transparent 70%)' }}>
          <svg
            viewBox="60 15 700 700"
            style={{ width: '100%', height: '480px', display: 'block' }}
            onMouseLeave={() => setHovered(null)}>
            <defs>
              <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="bgGrad" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="rgba(0,80,160,0.08)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="800" height="900" fill="url(#bgGrad)" />

            {INDIA_STATES.map(state => {
              const info = stateMap[state.id]
              const hasData = info && info.total > 0
              const isHov = hovered === state.id
              const { fill, stroke } = getStateColor(info?.total, maxTotal, info?.ok_rate)

              return (
                <g key={state.id}
                  onMouseMove={e => {
                    const r = e.currentTarget.closest('svg').getBoundingClientRect()
                    setTip({ x: e.clientX - r.left, y: e.clientY - r.top })
                    setHovered(state.id)
                  }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => hasData && onStateClick(state.id)}
                  style={{ cursor: hasData ? 'pointer' : 'default' }}>
                  <path
                    d={state.d}
                    fill={fill}
                    stroke={isHov ? '#00b4ff' : stroke}
                    strokeWidth={isHov ? 2 : 1}
                    strokeLinejoin="round"
                    style={{ transition: 'all 0.15s', filter: isHov ? 'url(#glow)' : 'none', opacity: isHov ? 1 : 0.92 }}
                  />
                  {/* Label */}
                  <text
                    x={parseFloat(state.d.split(' ')[1]) + (parseFloat(state.d.split(' ')[state.d.split(' ').length - 4]) - parseFloat(state.d.split(' ')[1])) / 2}
                    y={parseFloat(state.d.split(' ')[2]) + (parseFloat(state.d.split(' ')[state.d.split(' ').length - 3]) - parseFloat(state.d.split(' ')[2])) / 2}
                    textAnchor="middle" dominantBaseline="central"
                    fontSize={hasData ? 9 : 7}
                    fontWeight={hasData ? 700 : 400}
                    fill={hasData ? 'rgba(230,245,255,0.92)' : 'rgba(150,180,220,0.25)'}
                    style={{ pointerEvents: 'none', fontFamily: 'DM Sans, sans-serif', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                    {state.ab}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Tooltip */}
          {hovered && stateMap[hovered] && (() => {
            const d = stateMap[hovered]
            const r = parseFloat(d.ok_rate || 0)
            const rc = r >= 75 ? '#00e87a' : r >= 50 ? '#ff9500' : '#ff4d4d'
            const left = Math.min(tip.x + 14, 550)
            const top = Math.max(tip.y - 90, 10)
            return (
              <Box sx={{ position: 'absolute', left, top, pointerEvents: 'none', zIndex: 200,
                background: 'rgba(6,12,24,0.96)', border: '1px solid rgba(0,180,255,0.25)',
                borderRadius: '12px', p: 1.8, minWidth: 175,
                boxShadow: '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,180,255,0.08)',
                backdropFilter: 'blur(16px)',
                animation: 'fadeIn 0.12s ease',
                '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
              }}>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#eaf3ff', mb: 1.2 }}>{hovered}</Typography>
                {[
                  { l: 'Total PCBs', v: Number(d.total).toLocaleString(), c: '#00b4ff' },
                  { l: 'Repaired OK', v: Number(d.ok).toLocaleString(), c: '#00e87a' },
                  { l: 'No Fault Found', v: Number(d.nff).toLocaleString(), c: '#ff9500' },
                  { l: 'OK Rate', v: `${d.ok_rate}%`, c: rc },
                ].map(row => (
                  <Box key={row.l} display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(120,160,210,0.55)' }}>{row.l}</Typography>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: row.c, fontFamily: "'DM Mono', monospace" }}>{row.v}</Typography>
                  </Box>
                ))}
                <Box sx={{ mt: 1, pt: 0.8, borderTop: '1px solid rgba(0,180,255,0.1)', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.6rem', color: 'rgba(0,180,255,0.7)' }}>Click to see cities →</Typography>
                </Box>
              </Box>
            )
          })()}

          {stateData.length === 0 && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.5 }}>
              <Typography sx={{ fontSize: '2.5rem', opacity: 0.2 }}>🗺️</Typography>
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(120,160,210,0.3)', textAlign: 'center' }}>Upload Excel data to activate the map</Typography>
            </Box>
          )}
        </Box>
      ) : (
        /* ── CITY DRILL-DOWN ── */
        <Box sx={{ animation: 'fadeIn 0.3s ease', '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } } }}>
          {cityData?.cities?.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 1.5, maxHeight: 455, overflowY: 'auto', pr: 0.5 }}>
              {cityData.cities.map((city, i) => {
                const okR = city.total > 0 ? ((city.ok / city.total) * 100).toFixed(1) : 0
                const rc = parseFloat(okR) >= 75 ? '#00e87a' : parseFloat(okR) >= 50 ? '#ff9500' : '#ff4d4d'
                return (
                  <Box key={city.city} sx={{
                    p: 1.8, borderRadius: '12px',
                    background: 'linear-gradient(145deg, rgba(13,22,38,0.9), rgba(17,30,53,0.9))',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                    animation: `fadeUp 0.3s ease ${i * 0.04}s both`,
                    '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                    transition: 'all 0.2s',
                    '&:hover': { border: '1px solid rgba(0,180,255,0.22)', transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,180,255,0.1)' }
                  }}>
                    <Box display="flex" alignItems="center" gap={0.7} mb={0.8}>
                      <LocationOnIcon sx={{ color: '#00b4ff', fontSize: 12 }} />
                      <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#eaf3ff' }}>{city.city}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '1.3rem', fontWeight: 800, color: '#00b4ff', fontFamily: "'DM Mono',monospace", lineHeight: 1, mb: 0.6 }}>
                      {city.total.toLocaleString()}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={0.6}>
                      <Typography sx={{ fontSize: '0.6rem', color: '#00e87a', fontWeight: 600 }}>OK {city.ok}</Typography>
                      <Typography sx={{ fontSize: '0.6rem', color: '#ff9500', fontWeight: 600 }}>NFF {city.nff}</Typography>
                    </Box>
                    <Box sx={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', mb: 0.4 }}>
                      <Box sx={{ height: '100%', width: `${okR}%`, background: `linear-gradient(90deg, ${rc}, ${rc}88)`, borderRadius: 2, transition: 'width 1.2s ease' }} />
                    </Box>
                    <Typography sx={{ fontSize: '0.6rem', color: rc, fontWeight: 700 }}>{okR}% OK Rate</Typography>
                  </Box>
                )
              })}
            </Box>
          ) : (
            <Box display="flex" alignItems="center" justifyContent="center" height={300} flexDirection="column" gap={1}>
              <Typography sx={{ fontSize: '2rem', opacity: 0.2 }}>🏙️</Typography>
              <Typography sx={{ color: 'rgba(120,160,210,0.3)', fontSize: '0.8rem' }}>No city data for {selectedState}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
