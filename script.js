// Ganti dengan kredensial Supabase-mu
const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_PUBLIC_ANON_KEY';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Ambil data terakhir
async function fetchLatestData() {
  const { data: kelembaban, error: err1 } = await supabase
    .from('kelembaban')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  const { data: penyiraman, error: err2 } = await supabase
    .from('penyiraman')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  if (kelembaban && kelembaban.length > 0) {
    document.getElementById('kelembaban').textContent = kelembaban[0].kelembapan + '%';
  }

  if (penyiraman && penyiraman.length > 0) {
    const waktu = new Date(penyiraman[0].waktu).toLocaleString('id-ID');
    document.getElementById('waktuPenyiraman').textContent = waktu;
  }
}

// Realtime listener (kelembaban)
supabase
  .channel('public:kelembaban')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'kelembaban' }, payload => {
    fetchLatestData();
  })
  .subscribe();

supabase
  .channel('public:penyiraman')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'penyiraman' }, payload => {
    fetchLatestData();
  })
  .subscribe();

fetchLatestData();
