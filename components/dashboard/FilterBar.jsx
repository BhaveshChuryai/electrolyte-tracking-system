import { Box, Typography, MenuItem, Select, Button, FormControl, InputLabel, TextField, InputAdornment, Chip } from '@mui/material'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SearchIcon from '@mui/icons-material/Search'

const sel = {
  color: '#eaf3ff', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', fontSize: '0.8rem',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.08)' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,180,255,0.3)' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00b4ff' },
  '& .MuiSvgIcon-root': { color: 'rgba(120,160,210,0.5)' },
}

const mp = { PaperProps: { sx: { background: '#0d1626', border: '1px solid rgba(0,180,255,0.12)', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', '& .MuiMenuItem-root': { color: 'rgba(160,200,255,0.7)', fontSize: '0.8rem', '&:hover': { background: 'rgba(0,180,255,0.08)' }, '&.Mui-selected': { background: 'rgba(0,180,255,0.12)', color: '#00b4ff' } } } } }

export default function FilterBar({ filters, onFilterChange, onReset, pcbList = [] }) {
  const active = [filters.status !== 'all', filters.part_code !== 'all', filters.search !== ''].filter(Boolean).length

  return (
    <Box sx={{ p: 2.2, borderRadius: '14px', mb: 2.5, background: 'linear-gradient(145deg, #0d1626, #111e35)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.8}>
        <Box display="flex" alignItems="center" gap={1}>
          <FilterListRoundedIcon sx={{ color: '#00b4ff', fontSize: 16 }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#eaf3ff' }}>Filters</Typography>
          {active > 0 && <Chip label={`${active} active`} size="small" sx={{ background: 'rgba(0,180,255,0.12)', border: '1px solid rgba(0,180,255,0.25)', color: '#00b4ff', fontSize: '0.6rem', height: 18, fontWeight: 700 }} />}
        </Box>
        {active > 0 && (
          <Button onClick={onReset} startIcon={<RestartAltIcon sx={{ fontSize: 14 }} />} size="small"
            sx={{ color: '#ff4d4d', border: '1px solid rgba(255,77,77,0.2)', borderRadius: '8px', fontSize: '0.7rem', py: 0.4, px: 1.2, '&:hover': { background: 'rgba(255,77,77,0.07)', border: '1px solid rgba(255,77,77,0.4)' } }}>
            Reset
          </Button>
        )}
      </Box>
      <Box display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
        <TextField size="small" placeholder="Search PCB, branch..." value={filters.search} onChange={(e) => onFilterChange({ search: e.target.value })}
          sx={{ minWidth: 210, '& .MuiOutlinedInput-root': { color: '#eaf3ff', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', fontSize: '0.8rem', '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' }, '&:hover fieldset': { borderColor: 'rgba(0,180,255,0.3)' }, '&.Mui-focused fieldset': { borderColor: '#00b4ff' } }, '& input::placeholder': { color: 'rgba(120,160,210,0.35)', opacity: 1 } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(120,160,210,0.4)', fontSize: 16 }} /></InputAdornment> }} />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: 'rgba(120,160,210,0.45)', fontSize: '0.78rem' }}>Status</InputLabel>
          <Select value={filters.status} label="Status" onChange={(e) => onFilterChange({ status: e.target.value })} sx={sel} MenuProps={mp}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="OK">✅ OK (Repaired)</MenuItem>
            <MenuItem value="NFF">⚠️ NFF (No Fault)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 155 }}>
          <InputLabel sx={{ color: 'rgba(120,160,210,0.45)', fontSize: '0.78rem' }}>PCB Code</InputLabel>
          <Select value={filters.part_code} label="PCB Code" onChange={(e) => onFilterChange({ part_code: e.target.value })} sx={sel} MenuProps={mp}>
            <MenuItem value="all">All PCBs</MenuItem>
            {pcbList.map(p => <MenuItem key={p.part_code} value={p.part_code}>{p.part_code}</MenuItem>)}
          </Select>
        </FormControl>

        {filters.status !== 'all' && <Chip label={`Status: ${filters.status}`} size="small" onDelete={() => onFilterChange({ status: 'all' })} sx={{ background: 'rgba(0,180,255,0.08)', border: '1px solid rgba(0,180,255,0.18)', color: '#00b4ff', fontSize: '0.68rem', height: 22, '& .MuiChip-deleteIcon': { color: '#00b4ff', fontSize: 14 } }} />}
        {filters.part_code !== 'all' && <Chip label={`PCB: ${filters.part_code}`} size="small" onDelete={() => onFilterChange({ part_code: 'all' })} sx={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)', color: '#a78bfa', fontSize: '0.68rem', height: 22, '& .MuiChip-deleteIcon': { color: '#a78bfa', fontSize: 14 } }} />}
      </Box>
    </Box>
  )
}
