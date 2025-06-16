export default async function handler(req, res) {
  const { metode, durasi, waktu } = req.query;

  if (!metode || !durasi || !waktu) {
    return res.status(400).json({ error: 'metode, durasi, dan waktu harus disediakan' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const table = process.env.SUPABASE_TABLE_PENYIRAMAN;

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
        metode,
        durasi: parseInt(durasi),
        waktu
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Gagal menyimpan ke Supabase', detail: data });
    }

    return res.status(200).json({ message: 'Penyiraman berhasil disimpan', data });

  } catch (err) {
    return res.status(500).json({ error: 'Terjadi kesalahan server', detail: err.message });
  }
}
