import pool from '../../lib/db'
import multer from 'multer'
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

export const config = { api: { bodyParser: false } }

// Ensure upload dir exists
const uploadDir = '/tmp/pcb_uploads'
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({
  dest: uploadDir,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (['.xlsx', '.xlsm'].includes(ext)) cb(null, true)
    else cb(new Error('Only .xlsx and .xlsm files allowed'))
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
})

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => (result instanceof Error ? reject(result) : resolve(result)))
  })

const SKIP_SHEETS = ['Master_Summary', 'Dashboard', 'Pivot']

const parseDate = (val) => {
  if (!val) return null
  if (val instanceof Date) return isNaN(val) ? null : val
  if (typeof val === 'number') {
    const date = new Date((val - 25569) * 86400 * 1000)
    return isNaN(date) ? null : date
  }
  if (typeof val === 'string') {
    const d = new Date(val)
    return isNaN(d) ? null : d
  }
  return null
}

const cleanStr = (val) => {
  if (!val) return null
  const s = String(val).trim()
  return s === 'NA' || s === 'nan' || s === 'N/A' || s === '' ? null : s
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  let uploadId = null
  let filePath = null

  try {
    await runMiddleware(req, res, upload.single('file'))
    filePath = req.file.path

    // Log start
    const logResult = await pool.query(
      `INSERT INTO upload_history (filename, original_name, status) VALUES ($1, $2, 'processing') RETURNING id`,
      [req.file.filename, req.file.originalname]
    )
    uploadId = logResult.rows[0].id

    // Read workbook
    const workbook = XLSX.readFile(filePath)
    const pcbSheets = workbook.SheetNames.filter((s) => !SKIP_SHEETS.includes(s))

    let totalRows = 0
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // Clear existing data for fresh upload
      await client.query('DELETE FROM pcb_data')
      await client.query('DELETE FROM component_data')
      await client.query('DELETE FROM status_data')
      await client.query('DELETE FROM pcb_master')

      // Process each PCB sheet
      for (const sheetName of pcbSheets) {
        const partCode = parseInt(sheetName)
        if (isNaN(partCode)) continue

        const ws = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null, raw: false })
        if (rows.length === 0) continue

        // Get product description from first row
        const productDesc = cleanStr(rows[0]?.['Product Description'])
        const dcNo = cleanStr(rows[0]?.['DC No.'])

        // Upsert PCB master
        await client.query(`
          INSERT INTO pcb_master (part_code, product_description, total_entries, dc_no, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (part_code) DO UPDATE SET
            product_description = EXCLUDED.product_description,
            total_entries = EXCLUDED.total_entries,
            dc_no = EXCLUDED.dc_no,
            updated_at = NOW()
        `, [partCode, productDesc, rows.length, dcNo])

        // Insert PCB data rows in batches
        for (const row of rows) {
          await client.query(`
            INSERT INTO pcb_data (
              sr_no, dc_no, dc_date, branch, bccd_name,
              product_description, product_sr_no, date_of_purchase,
              complaint_no, part_code, defect, visiting_tech_name,
              mfg_month_year, repair_date, defect_age, pcb_sr_no,
              rf_observation, testing, failure, analysis,
              component_consumption, status, send_date,
              engg_name, tag_entry_by, consumption_entry
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,
              $13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26
            )
          `, [
            row['Sr. No.'] ? parseInt(row['Sr. No.']) : null,
            cleanStr(row['DC No.']),
            parseDate(row['DC Date']),
            cleanStr(row['Branch']),
            cleanStr(row['BCCD Name']),
            cleanStr(row['Product Description']),
            cleanStr(row['Product Sr. No.']),
            cleanStr(row['Date of Purchase']),
            row['Complaint No.'] ? String(row['Complaint No.']).substring(0, 150) : null,
            partCode,
            cleanStr(row['Defect']),
            cleanStr(row['Visiting Tech Name']),
            cleanStr(row['Mfg Month/Year']),
            parseDate(row['Repair Date']),
            cleanStr(row['Defect Age (Years, Months, Days)']),
            cleanStr(row['PCB Sr. No.']),
            cleanStr(row['RF Observation']),
            cleanStr(row['Testing']),
            cleanStr(row['Failure']),
            cleanStr(row['Analysis']),
            cleanStr(row['Component Consumption']),
            cleanStr(row['Status']),
            parseDate(row['Send Date']),
            cleanStr(row['Engg. Name']),
            cleanStr(row['Tag Entry By']),
            cleanStr(row['Consumption Entry']),
          ])
          totalRows++
        }
      }

      // Process Master_Summary
      if (workbook.SheetNames.includes('Master_Summary')) {
        const mws = workbook.Sheets['Master_Summary']
        const mrows = XLSX.utils.sheet_to_json(mws, { defval: null, header: 1 })

        for (let i = 1; i < mrows.length; i++) {
          const row = mrows[i]
          if (!row || row.length === 0) continue

          // Component data: cols 0-3 (Spare Part Code, Component, Description, Count)
          const compPartCode = row[0] ? parseInt(row[0]) : null
          const component = row[1] ? String(row[1]).trim() : null
          const description = row[2] ? String(row[2]).trim() : null
          const count = row[3] ? parseInt(row[3]) : 0

          if (compPartCode && component && !isNaN(compPartCode)) {
            await client.query(`
              INSERT INTO component_data (part_code, component, description, count)
              VALUES ($1, $2, $3, $4)
            `, [compPartCode, component, description, count])
          }

          // Status data: cols 4-7 (Spare Part Code, Status, Status Description, Status Count)
          const statusPartCode = row[4] ? parseInt(row[4]) : null
          const status = row[5] ? String(row[5]).trim() : null
          const statusDesc = row[6] ? String(row[6]).trim() : null
          const statusCount = row[7] ? parseInt(row[7]) : 0

          if (statusPartCode && status && !isNaN(statusPartCode)) {
            await client.query(`
              INSERT INTO status_data (part_code, status, status_description, status_count)
              VALUES ($1, $2, $3, $4)
            `, [statusPartCode, status, statusDesc, statusCount])
          }
        }
      }

      await client.query('COMMIT')

      await pool.query(`
        UPDATE upload_history SET total_rows=$1, pcb_sheets=$2, status='success'
        WHERE id=$3
      `, [totalRows, pcbSheets, uploadId])

      res.json({
        success: true,
        message: 'File uploaded and processed successfully!',
        total_rows: totalRows,
        sheets_processed: pcbSheets.length,
        pcb_sheets: pcbSheets,
      })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('Upload Error:', err)
    if (uploadId) {
      await pool.query(
        `UPDATE upload_history SET status='failed', error_message=$1 WHERE id=$2`,
        [err.message, uploadId]
      )
    }
    res.status(500).json({ error: err.message })
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}
