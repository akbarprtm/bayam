import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ctggbrmvubjggyxmmbse.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA' // Jangan pakai anon key untuk insert langsung dari server
)

export default async function handler(req, res) {
  const { kelembapan, metode, durasi, waktu } = req.query

  if (!kelembapan || !metode || !durasi || !waktu) {
    return res.status(400).json({ error: 'Parameter tidak lengkap' })
  }

  const { data, error } = await supabase
    .from('data')
    .insert([
      { kelembapan: parseInt(kelembapan), metode, durasi: parseInt(durasi), waktu }
    ])
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ message: 'Data berhasil disimpan', data })
}
