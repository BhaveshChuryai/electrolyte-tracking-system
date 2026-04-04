import { useState } from 'react'
import { Box, Typography } from '@mui/material'

const INDIA_STATES = [
  { id: 'Jammu & Kashmir', label: ['Jammu and', 'Kashmir'], cx: 256, cy: 84, d: 'M215 48 L255 32 L296 38 L325 46 L336 67 L327 87 L301 100 L270 102 L233 92 L214 74 Z' },
  { id: 'Punjab', label: ['Punjab'], cx: 247, cy: 137, d: 'M210 110 L253 104 L271 122 L264 151 L242 164 L213 153 L202 130 Z' },
  { id: 'Himachal Pradesh', label: ['Himachal', 'Pradesh'], cx: 286, cy: 128, d: 'M257 102 L303 102 L321 118 L315 144 L292 156 L266 146 L258 124 Z' },
  { id: 'Uttarakhand', label: ['Uttarakhand'], cx: 351, cy: 138, d: 'M318 118 L366 112 L388 129 L380 154 L350 166 L324 151 Z' },
  { id: 'Haryana', label: ['Haryana'], cx: 270, cy: 176, d: 'M236 154 L282 150 L297 171 L289 198 L259 208 L235 189 Z' },
  { id: 'Delhi', label: ['Delhi'], cx: 303, cy: 188, d: 'M295 181 L311 180 L317 194 L302 201 L292 192 Z' },
  { id: 'Rajasthan', label: ['Rajasthan'], cx: 194, cy: 260, d: 'M124 178 L279 172 L299 202 L294 273 L266 323 L212 341 L161 331 L119 295 L104 242 Z' },
  { id: 'Uttar Pradesh', label: ['Uttar', 'Pradesh'], cx: 382, cy: 231, d: 'M294 183 L406 173 L470 191 L490 222 L481 260 L433 279 L356 286 L308 260 L287 230 Z' },
  { id: 'Bihar', label: ['Bihar'], cx: 491, cy: 238, d: 'M470 192 L530 191 L556 208 L551 240 L522 260 L483 256 L461 234 Z' },
  { id: 'Sikkim', label: ['Sikkim'], cx: 570, cy: 226, d: 'M563 213 L576 211 L582 222 L572 229 L561 223 Z' },
  { id: 'West Bengal', label: ['West', 'Bengal'], cx: 562, cy: 315, d: 'M552 239 L591 228 L614 249 L611 302 L592 336 L566 351 L541 327 L534 279 Z' },
  { id: 'Jharkhand', label: ['Jharkhand'], cx: 487, cy: 308, d: 'M456 259 L520 258 L541 277 L535 314 L505 334 L468 329 L449 303 Z' },
  { id: 'Odisha', label: ['Odisha'], cx: 512, cy: 383, d: 'M483 334 L543 328 L568 352 L562 404 L530 432 L492 429 L469 396 L471 359 Z' },
  { id: 'Chhattisgarh', label: ['Chhattisgarh'], cx: 400, cy: 350, d: 'M334 287 L460 279 L480 309 L473 374 L439 407 L392 412 L353 385 L337 336 Z' },
  { id: 'Madhya Pradesh', label: ['Madhya', 'Pradesh'], cx: 305, cy: 338, d: 'M210 304 L347 294 L375 320 L367 378 L332 410 L276 415 L227 397 L196 365 L190 329 Z' },
  { id: 'Gujarat', label: ['Gujarat'], cx: 127, cy: 355, d: 'M68 266 L176 260 L202 307 L199 366 L174 418 L135 439 L96 433 L64 393 L54 333 Z' },
  { id: 'Maharashtra', label: ['Maharashtra'], cx: 288, cy: 494, d: 'M193 417 L374 410 L399 449 L392 512 L351 553 L289 566 L234 556 L193 523 L175 474 Z' },
  { id: 'Goa', label: ['Goa'], cx: 197, cy: 548, d: 'M188 537 L202 535 L208 547 L196 553 L186 546 Z' },
  { id: 'Telangana', label: ['Telangana'], cx: 394, cy: 470, d: 'M360 408 L468 403 L488 431 L480 476 L444 494 L392 489 L359 462 Z' },
  { id: 'Andhra Pradesh', label: ['Andhra', 'Pradesh'], cx: 470, cy: 539, d: 'M434 429 L566 419 L592 459 L584 528 L549 572 L499 588 L454 574 L422 534 L420 476 Z' },
  { id: 'Karnataka', label: ['Karnataka'], cx: 282, cy: 624, d: 'M183 559 L350 552 L373 596 L368 658 L337 702 L291 714 L243 704 L204 675 L184 627 Z' },
  { id: 'Kerala', label: ['Kerala'], cx: 222, cy: 742, d: 'M198 703 L255 710 L246 760 L233 814 L214 842 L190 837 L173 801 L179 744 Z' },
  { id: 'Tamil Nadu', label: ['Tamil Nadu'], cx: 361, cy: 760, d: 'M284 709 L404 699 L435 735 L428 799 L393 844 L347 851 L307 832 L283 787 L278 738 Z' },
  { id: 'Assam', label: ['Assam'], cx: 647, cy: 257, d: 'M615 234 L686 228 L713 245 L705 265 L664 277 L627 268 L611 248 Z' },
  { id: 'Arunachal Pradesh', label: ['Arunachal', 'Pradesh'], cx: 683, cy: 205, d: 'M603 180 L691 174 L733 193 L728 221 L688 236 L646 230 L605 210 Z' },
  { id: 'Meghalaya', label: ['Meghalaya'], cx: 624, cy: 293, d: 'M596 278 L645 275 L655 289 L644 304 L610 303 L595 291 Z' },
  { id: 'Nagaland', label: ['Nagaland'], cx: 696, cy: 279, d: 'M682 262 L704 258 L710 279 L694 290 L680 281 Z' },
  { id: 'Manipur', label: ['Manipur'], cx: 706, cy: 322, d: 'M693 295 L715 292 L721 321 L706 336 L690 326 Z' },
  { id: 'Mizoram', label: ['Mizoram'], cx: 680, cy: 367, d: 'M666 340 L688 335 L696 372 L679 389 L663 377 Z' },
  { id: 'Tripura', label: ['Tripura'], cx: 654, cy: 338, d: 'M645 315 L661 314 L666 340 L651 349 L640 337 Z' },
]

function getFill(total, max) {
  if (!total) return '#475569'
  const ratio = Math.max(0.22, total / max)
  return `rgba(56, 189, 248, ${Math.min(0.96, ratio + 0.18)})`
}

export default function IndiaMap({ states = [], activeState, onStateClick }) {
  const [hovered, setHovered] = useState(null)
  const stateMap = Object.fromEntries(states.map((item) => [item.state, item]))
  const max = Math.max(...states.map((item) => item.total), 1)

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '1rem' }}>India PCB Distribution</Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.76rem', mt: 0.4 }}>State names and PCB counts are drawn directly on the map. Brighter blue means more PCB volume.</Typography>
        </Box>
      </Box>

      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 4, background: 'radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 24%), linear-gradient(180deg, #08111f 0%, #10233f 100%)', minHeight: 740, border: '1px solid rgba(56, 189, 248, 0.14)' }}>
        <svg viewBox="28 20 740 860" style={{ width: '100%', height: '740px', display: 'block' }}>
          {INDIA_STATES.map((state) => {
            const metrics = stateMap[state.id]
            const active = activeState === state.id
            const hovering = hovered === state.id
            return (
              <g key={state.id} onMouseEnter={() => setHovered(state.id)} onMouseLeave={() => setHovered(null)} onClick={() => metrics && onStateClick?.(state.id)} style={{ cursor: metrics ? 'pointer' : 'default' }}>
                <path d={state.d} fill={getFill(metrics?.total || 0, max)} stroke={active || hovering ? '#e2e8f0' : 'rgba(226,232,240,0.35)'} strokeWidth={active || hovering ? 2.2 : 1.15} strokeLinejoin="round" style={{ transition: 'all 0.16s ease' }} />
                <text x={state.cx} y={state.cy} textAnchor="middle" fill={metrics ? '#e2e8f0' : '#cbd5e1'} fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>
                  {state.label.map((line, index) => (
                    <tspan key={`${state.id}-${line}`} x={state.cx} dy={index === 0 ? 0 : 12}>{line}</tspan>
                  ))}
                </text>
                {metrics ? <text x={state.cx} y={state.cy + state.label.length * 12 + 10} textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>{metrics.total}</text> : null}
              </g>
            )
          })}
        </svg>

        {hovered && stateMap[hovered] ? (
          <Box sx={{ position: 'absolute', top: 18, right: 18, width: 220, p: 1.7, borderRadius: 3, background: 'rgba(8, 17, 31, 0.96)', border: '1px solid rgba(125, 211, 252, 0.18)', boxShadow: '0 18px 45px rgba(2, 8, 23, 0.34)' }}>
            <Typography sx={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>{hovered}</Typography>
            <Typography sx={{ color: '#e2e8f0', fontSize: '0.74rem', mt: 0.6 }}>PCB Count: {stateMap[hovered].total}</Typography>
            <Typography sx={{ color: '#22c55e', fontSize: '0.74rem', mt: 0.35 }}>OK: {stateMap[hovered].ok}</Typography>
            <Typography sx={{ color: '#f59e0b', fontSize: '0.74rem', mt: 0.25 }}>NFF: {stateMap[hovered].nff}</Typography>
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
