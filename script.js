// Ganti dengan kredensial Supabase-mu
const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Buat chart kelembapan
let kelembapanChart;
function initChart() {
  const ctx = document.getElementById('chartKelembapan').getContext('2d');
  kelembapanChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [], // waktu
      datasets: [{
        label: 'Kelembapan (%)',
        data: [],
        fill: true,
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: { color: '#4B5563' }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#4B5563' }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#4B5563'
          }
        }
      }
    }
  });
}

// Ambil data terakhir
async function fetchLatestData() {
  const { data: kelembapan, error: err1 } = await supabase
    .from('sensor_data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  const { data: penyiraman, error: err2 } = await supabase
    .from('penyiraman')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  if (kelembapan && kelembapan.length > 0) {
    document.getElementById('kelembapan').textContent = kelembapan[0].kelembapan + '%';
  }

  if (penyiraman && penyiraman.length > 0) {
    const waktu = new Date(penyiraman[0].waktu).toLocaleString('id-ID');
    document.getElementById('waktuPenyiraman').textContent = waktu;
  }
}

// Ambil data untuk grafik
async function fetchChartData() {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(7);

  if (data) {
    const reversed = data.reverse(); // agar urut waktu naik
    kelembapanChart.data.labels = reversed.map(item => {
      const waktu = new Date(item.waktu);
      return waktu.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    });

    kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
    kelembapanChart.update();
  }
}

// Realtime listener untuk kelembapan
supabase
  .channel('public:sensor_data')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'sensor_data' }, payload => {
    fetchLatestData();
    fetchChartData();
  })
  .subscribe();

// Realtime listener untuk penyiraman
supabase
  .channel('public:penyiraman')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'penyiraman' }, payload => {
    fetchLatestData();
  })
  .subscribe();

// Inisialisasi
initChart();
fetchLatestData();
fetchChartData();
