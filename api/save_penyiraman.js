export default async function handler(req, res) {
  const { metode, durasi, waktu } = req.query;

  if (!metode || !durasi || !waktu) {
    return res.status(400).json({ error: 'metode, durasi, dan waktu harus disediakan' });
  }

  const supabaseUrl = 'https://ctggbrmvubjggyxmmbse.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTE4NDcsImV4cCI6MjA2MzgyNzg0N30.6la5T8_8wrme55wKM7_r7kA6SO90-ht8JlP8aE3C6UA';
  const table = 'penyiraman';

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
        metode: metode,
        durasi_detik: parseInt(durasi),
        waktu: waktu
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: 'Gagal menyimpan ke Supabase', detail: data });
    }

    return res.status(200).json({ message: '✅ Penyiraman berhasil disimpan', data });

  } catch (err) {
    return res.status(500).json({ error: '❌ Terjadi kesalahan server', detail: err.message });
  }
}
