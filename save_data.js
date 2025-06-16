export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const table = process.env.SUPABASE_TABLE_KELEMBABAN;

  let kelembapan;

  if (req.method === 'GET') {
    kelembapan = req.query.kelembapan;
  } else if (req.method === 'POST') {
    kelembapan = req.body.kelembapan;
  } else {
    return res.status(405).json({ error: 'Method tidak diizinkan' });
  }

  if (!kelembapan || isNaN(kelembapan)) {
    return res.status(400).json({ error: 'Parameter kelembapan harus berupa angka' });
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nilai: parseInt(kelembapan),
        waktu: new Date().toISOString()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Gagal menyimpan ke Supabase', detail: data });
    }

    return res.status(200).json({ message: '✅ Kelembapan berhasil disimpan', data });

  } catch (err) {
    return res.status(500).json({ error: 'Terjadi kesalahan server', detail: err.message });
  }
}
