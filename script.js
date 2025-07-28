const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let kelembapanChart = null;

// Fungsi format waktu
function formatWaktuTanpaKonversi(isoString) {
  const [tanggalPart, waktuPart] = isoString.split('T');
  const [tahun, bulan, hari] = tanggalPart.split('-');
  const [jam, menit, detik] = waktuPart.split(':');
  return {
    tanggal: `${hari}/${bulan}/${tahun.slice(2)}`,
    jam: `${jam}.${menit}.${detik.slice(0, 2)}`
  };
}

// Fungsi update tabel
function updateTabelKelembapan(data) {
  const tbody = document.getElementById('tabelKelembapan');
  if (!tbody) {
    console.error('Element tabelKelembapan tidak ditemukan');
    return;
  }

  // Data terbaru paling atas
  const reversedData = [...data].reverse();

  tbody.innerHTML = '';

  reversedData.forEach((item, index) => {
    const waktu = new Date(item.waktu);
    const tanggal = waktu.toLocaleDateString('id-ID', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\//g, '/');

    const jamFormatted = waktu.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(/:/g, '.');

    const row = `
      <tr class="border">
        <td class="border px-2 py-1">${index + 1}</td>
        <td class="border px-2 py-1">${tanggal}</td>
        <td class="border px-2 py-1">${jamFormatted}</td>
        <td class="border px-2 py-1">${item.kelembapan}</td>
        <td class="border px-2 py-1">${item.durasi_detik} detik</td>
        <td class="border px-2 py-1">${item.metode}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Fungsi update grafik
function updateChart(data) {
  const ctx = document.getElementById('chartKelembapan').getContext('2d');
  if (kelembapanChart) kelembapanChart.destroy();

  const labels = data.map(item => {
    const waktu = new Date(item.waktu);

    const tanggal = waktu.toLocaleDateString('id-ID', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });

    const jam = waktu.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    // Gabungkan dengan baris atas: tanggal di atas jam
    return `${tanggal}\n${jam}`;
  });

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
        },
        x: {
          ticks: {
            callback: function(value, index, ticks) {
              return this.getLabelForValue(value).replace('\n', '\n');
            }
          }
        }
      }
    }
  });
}

// Ambil data dari Supabase
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

// Jalankan awal dan setiap 5 detik
fetchLatestData();
setInterval(fetchLatestData, 5000);
