const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Fungsi konversi UTC ke WIB
function konversiWaktuUTCkeWIB(utcString) {
  const waktuUTC = new Date(utcString);

  const formatterTanggal = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
  const formatterJam = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const tanggal = formatterTanggal.format(waktuUTC);
  const jam = formatterJam.format(waktuUTC);

  return { tanggal, jam };
}


// Update isi tabel
function updateTabelKelembapan(data) {
  const tbody = document.getElementById('tabelKelembapan');
  tbody.innerHTML = '';

  data.slice().reverse().forEach((item, index) => {
    const { tanggal, jam } = konversiWaktuUTCkeWIB(item.waktu);

    const durasi = item.durasi || 0;
    const metode = item.metode === 'manual' ? 'Manual' :
                   item.metode === 'otomatis' ? 'Otomatis' : '-';

    tbody.innerHTML += `
      <tr class="border-t">
        <td class="px-4 py-2 text-center">${index + 1}</td>
        <td class="px-4 py-2">${tanggal}</td>
        <td class="px-4 py-2">${jam}</td>
        <td class="px-4 py-2">${item.kelembapan}%</td>
        <td class="px-4 py-2">${durasi}</td>
        <td class="px-4 py-2">${metode}</td>
      </tr>
    `;
  });
}

// Variabel Chart.js
let kelembapanChart = null;

// Fungsi update grafik
function updateChart(data) {
  const ctx = document.getElementById('chartKelembapan').getContext('2d');

  if (kelembapanChart) {
    kelembapanChart.destroy();
  }

  const labels = data.map(item => konversiWaktuUTCkeWIB(item.waktu).jam);
  const values = data.map(item => item.kelembapan);

  kelembapanChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Kelembapan (%)',
        data: values,
        borderColor: 'blue',
        fill: false,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

// Ambil data dan update UI
async function fetchLatestData() {
  const { data, error } = await supabase
    .from('data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Gagal mengambil data:', error.message);
    return;
  }

  updateTabelKelembapan(data);
  updateChart(data);
}

// Panggil awal saat halaman dimuat
fetchLatestData();

// Refresh otomatis tiap 5 detik
setInterval(() => {
  fetchLatestData();
}, 5000);

