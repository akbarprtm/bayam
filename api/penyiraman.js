import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ctggbrmvubjggyxmmbse.supabase.co',
  'YOUR_SUPABASE_SERVICE_ROLE_KEY' // Jangan pakai anon key untuk insert langsung dari server
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
