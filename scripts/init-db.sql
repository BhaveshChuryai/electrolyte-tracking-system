-- =============================================
-- Electrolyte Bajaj PCB Dashboard
-- PostgreSQL Database Schema
-- =============================================

-- PCB Master table
CREATE TABLE IF NOT EXISTS pcb_master (
  id SERIAL PRIMARY KEY,
  part_code BIGINT UNIQUE NOT NULL,
  product_description VARCHAR(300),
  total_entries INTEGER DEFAULT 0,
  dc_no VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Main PCB repair data table
CREATE TABLE IF NOT EXISTS pcb_data (
  id SERIAL PRIMARY KEY,
  sr_no INTEGER,
  dc_no VARCHAR(50),
  dc_date DATE,
  branch VARCHAR(100),
  bccd_name VARCHAR(200),
  product_description VARCHAR(300),
  product_sr_no VARCHAR(100),
  date_of_purchase VARCHAR(100),
  complaint_no VARCHAR(150),
  part_code BIGINT NOT NULL,
  defect VARCHAR(200),
  visiting_tech_name VARCHAR(150),
  mfg_month_year VARCHAR(100),
  repair_date DATE,
  defect_age VARCHAR(200),
  pcb_sr_no VARCHAR(100),
  rf_observation VARCHAR(200),
  testing VARCHAR(50),
  failure VARCHAR(200),
  analysis TEXT,
  component_consumption TEXT,
  status VARCHAR(20),
  send_date DATE,
  engg_name VARCHAR(100),
  tag_entry_by VARCHAR(100),
  consumption_entry VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Component consumption table
CREATE TABLE IF NOT EXISTS component_data (
  id SERIAL PRIMARY KEY,
  part_code BIGINT NOT NULL,
  component VARCHAR(100),
  description TEXT,
  count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Status summary table
CREATE TABLE IF NOT EXISTS status_data (
  id SERIAL PRIMARY KEY,
  part_code BIGINT NOT NULL,
  status VARCHAR(20),
  status_description VARCHAR(100),
  status_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Upload history table
CREATE TABLE IF NOT EXISTS upload_history (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  total_rows INTEGER DEFAULT 0,
  pcb_sheets TEXT[],
  status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_pcb_data_part_code ON pcb_data(part_code);
CREATE INDEX IF NOT EXISTS idx_pcb_data_status ON pcb_data(status);
CREATE INDEX IF NOT EXISTS idx_pcb_data_branch ON pcb_data(branch);
CREATE INDEX IF NOT EXISTS idx_pcb_data_repair_date ON pcb_data(repair_date);
CREATE INDEX IF NOT EXISTS idx_pcb_data_testing ON pcb_data(testing);
CREATE INDEX IF NOT EXISTS idx_component_part_code ON component_data(part_code);
CREATE INDEX IF NOT EXISTS idx_status_part_code ON status_data(part_code);

SELECT 'Database initialized successfully!' AS result;
