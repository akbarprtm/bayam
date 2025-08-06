import { createClient } from '@supabase/supabase-js'

// Ganti dengan kredensialmu
const supabaseUrl = 'https://ctggbrmvubjggyxmmbse.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA' // HARUS yang service_role
const supabase = createClient(supabaseUrl, supabaseKey)


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Hanya metode GET yang didukung.' });
  }

  const kelembapan = parseInt(req.query.kelembapan);
  const waktu = req.query.waktu;

  if (isNaN(kelembapan) || !waktu) {
    return res.status(400).json({ error: 'Parameter tidak lengkap atau salah format.' });
  }

  const { data, error } = await supabase
    .from('log_kelembapan_saja')
    .insert([{ kelembapan, waktu }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({
    message: 'Data kelembapan berhasil disimpan.',
    kelembapan,
    waktu,
  });
}
