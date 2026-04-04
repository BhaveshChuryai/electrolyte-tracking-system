-- =============================================
-- Electrolyte Bajaj PCB Dashboard
-- PostgreSQL Schema v2 — supports new Excel format
-- =============================================

-- Drop and recreate for clean slate (comment out if keeping data)
-- DROP TABLE IF EXISTS pcb_data, pcb_master, component_data, status_data, upload_history CASCADE;

CREATE TABLE IF NOT EXISTS pcb_master (
  id SERIAL PRIMARY KEY,
  part_code BIGINT UNIQUE NOT NULL,
  product_description VARCHAR(300),
  total_entries INTEGER DEFAULT 0,
  dc_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pcb_data (
  id SERIAL PRIMARY KEY,
  source_id INTEGER,                         -- original id from Excel/DB
  sr_no INTEGER,
  dc_no VARCHAR(50),
  dc_date DATE,
  branch VARCHAR(100),
  branch_normalized VARCHAR(100),            -- cleaned branch name
  bccd_name VARCHAR(200),
  product_description VARCHAR(300),
  product_sr_no VARCHAR(100),
  date_of_purchase VARCHAR(100),
  complaint_no VARCHAR(150),
  part_code BIGINT NOT NULL,
  defect VARCHAR(200),
  defect_normalized VARCHAR(100),            -- cleaned defect
  visiting_tech_name VARCHAR(150),
  mfg_month_year VARCHAR(100),
  repair_date DATE,
  pcb_sr_no VARCHAR(100),
  rf_observation VARCHAR(200),
  testing VARCHAR(50),
  failure VARCHAR(200),
  analysis TEXT,
  status VARCHAR(20),                        -- OK | NFF | WIP (null/unknown = WIP)
  validation_result TEXT,                    -- new column
  component_change TEXT,                     -- was "component_consumption"
  engg_name VARCHAR(100),
  tag_entry_by VARCHAR(100),
  consumption_entry_by VARCHAR(100),         -- was "consumption_entry"
  dispatch_entry_by VARCHAR(100),            -- new column
  dispatch_date DATE,                        -- was "send_date"
  source_created_at TIMESTAMP,
  source_updated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS component_data (
  id SERIAL PRIMARY KEY,
  part_code BIGINT NOT NULL,
  component VARCHAR(100),
  description TEXT,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS status_data (
  id SERIAL PRIMARY KEY,
  part_code BIGINT NOT NULL,
  status VARCHAR(20),
  status_description VARCHAR(100),
  status_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS upload_history (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  total_rows INTEGER DEFAULT 0,
  ok_rows INTEGER DEFAULT 0,
  nff_rows INTEGER DEFAULT 0,
  wip_rows INTEGER DEFAULT 0,
  pcb_sheets TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pcb_data_part_code ON pcb_data(part_code);
CREATE INDEX IF NOT EXISTS idx_pcb_data_status ON pcb_data(status);
CREATE INDEX IF NOT EXISTS idx_pcb_data_branch ON pcb_data(branch_normalized);
CREATE INDEX IF NOT EXISTS idx_pcb_data_repair_date ON pcb_data(repair_date);
CREATE INDEX IF NOT EXISTS idx_component_part_code ON component_data(part_code);

-- Add missing columns to existing table (safe to run multiple times)
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS source_id INTEGER;
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS branch_normalized VARCHAR(100);
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS defect_normalized VARCHAR(100);
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS validation_result TEXT;
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS component_change TEXT;
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS consumption_entry_by VARCHAR(100);
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS dispatch_entry_by VARCHAR(100);
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS dispatch_date DATE;
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS source_created_at TIMESTAMP;
ALTER TABLE pcb_data ADD COLUMN IF NOT EXISTS source_updated_at TIMESTAMP;
ALTER TABLE upload_history ADD COLUMN IF NOT EXISTS ok_rows INTEGER DEFAULT 0;
ALTER TABLE upload_history ADD COLUMN IF NOT EXISTS nff_rows INTEGER DEFAULT 0;
ALTER TABLE upload_history ADD COLUMN IF NOT EXISTS wip_rows INTEGER DEFAULT 0;

SELECT 'Schema v2 ready ✅' AS result;

-- =============================================
-- Corrections System — Fuzzy Matching & Learning
-- =============================================

-- Stores all approved corrections (system learns from these)
CREATE TABLE IF NOT EXISTS corrections (
  id SERIAL PRIMARY KEY,
  field VARCHAR(50) NOT NULL,        -- 'branch' | 'defect' | 'status' | 'component'
  original_value VARCHAR(255) NOT NULL,  -- what came in the Excel
  corrected_value VARCHAR(255) NOT NULL, -- what it should be
  confidence DECIMAL(5,2),           -- fuzzy match confidence 0-100
  method VARCHAR(20) DEFAULT 'fuzzy', -- 'fuzzy' | 'manual' | 'hardcoded'
  status VARCHAR(20) DEFAULT 'approved', -- 'approved' | 'auto-approved' | 'pending' | 'rejected'
  times_applied INTEGER DEFAULT 0,   -- how many times this fix was used
  approved_by VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(field, original_value)      -- one correction per unique value
);

-- Stores flagged values that need human review
CREATE TABLE IF NOT EXISTS flagged_values (
  id SERIAL PRIMARY KEY,
  field VARCHAR(50) NOT NULL,
  original_value VARCHAR(255) NOT NULL,
  suggested_value VARCHAR(255),      -- fuzzy match suggestion
  confidence DECIMAL(5,2),
  occurrences INTEGER DEFAULT 1,     -- how many times seen in uploads
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'ignored'
  upload_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(field, original_value)
);

-- Upload quality log — tracks data quality per upload
CREATE TABLE IF NOT EXISTS upload_quality_log (
  id SERIAL PRIMARY KEY,
  upload_id INTEGER REFERENCES upload_history(id),
  total_rows INTEGER DEFAULT 0,
  auto_fixed INTEGER DEFAULT 0,      -- fixed by hardcoded rules
  fuzzy_fixed INTEGER DEFAULT 0,     -- fixed by fuzzy matching
  flagged INTEGER DEFAULT 0,         -- sent to human review
  unknown_branches INTEGER DEFAULT 0,
  null_status_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_corrections_field ON corrections(field);
CREATE INDEX IF NOT EXISTS idx_corrections_original ON corrections(field, original_value);
CREATE INDEX IF NOT EXISTS idx_flagged_status ON flagged_values(status);
CREATE INDEX IF NOT EXISTS idx_flagged_field ON flagged_values(field);

-- Seed with known corrections from our analysis
INSERT INTO corrections (field, original_value, corrected_value, confidence, method, times_applied) VALUES
-- Branches already known
('branch', 'LKO', 'LUCKNOW', 100, 'hardcoded', 0),
('branch', 'Lko', 'LUCKNOW', 100, 'hardcoded', 0),
('branch', 'L.K.O', 'LUCKNOW', 100, 'hardcoded', 0),
('branch', 'PTNA', 'PATNA', 100, 'hardcoded', 0),
('branch', 'INDOR', 'INDORE', 100, 'hardcoded', 0),
('branch', 'GORAKPUR', 'GORAKHPUR', 100, 'hardcoded', 0),
('branch', 'RAIPOR', 'RAIPUR', 100, 'hardcoded', 0),
('branch', 'JABAIPUR', 'JABALPUR', 100, 'hardcoded', 0),
('branch', 'NAGPURQ', 'NAGPUR', 100, 'hardcoded', 0),
('branch', 'Nagapur', 'NAGPUR', 100, 'hardcoded', 0),
('branch', 'SHERHHATI', 'SHERGHATI', 100, 'hardcoded', 0),
('branch', 'MumbaNA', 'MUMBAI', 100, 'hardcoded', 0),
('branch', 'AGRD', 'AGRA', 100, 'hardcoded', 0),
('branch', 'BBSR', 'BHUBANESWAR', 100, 'hardcoded', 0),
('branch', 'BRSR', 'BHUBANESWAR', 100, 'hardcoded', 0),
('branch', 'BBER', 'BHUBANESWAR', 100, 'hardcoded', 0),
-- Defects
('defect', 'dead', 'DEAD', 100, 'hardcoded', 0),
('defect', 'Dead', 'DEAD', 100, 'hardcoded', 0),
('defect', 'Dead.', 'DEAD', 100, 'hardcoded', 0),
('defect', 'DEDA', 'DEAD', 100, 'hardcoded', 0),
('defect', 'Not working', 'NOT WORKING', 100, 'hardcoded', 0),
('defect', 'not working', 'NOT WORKING', 100, 'hardcoded', 0),
('defect', 'Not Working.', 'NOT WORKING', 100, 'hardcoded', 0)
ON CONFLICT (field, original_value) DO NOTHING;

SELECT 'Corrections system ready ✅' AS result;
