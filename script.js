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
    console.error("Element tabelKelembapan atau tbody tidak ditemukan");
    return;
  }

  tbody.innerHTML = '';

  data.forEach((item, index) => {
    const waktu = formatWaktuTanpaKonversi(item.waktu);
    const row = document.createElement('tr');
    row.classList.add('border');

    row.innerHTML = `
      <td class="border px-4 py-2">${index + 1}</td>
      <td class="border px-4 py-2">${waktu.tanggal}</td>
      <td class="border px-4 py-2">${waktu.jam}</td>
      <td class="border px-4 py-2">${item.kelembapan} %</td>
      <td class="border px-4 py-2">${item.durasi} detik</td>
      <td class="border px-4 py-2">${item.metode}</td>
    `;
    tbody.appendChild(row);
  });
}


// Fungsi update grafik
function updateChart(data) {
  const canvas = document.getElementById('chartKelembapan');
  if (!canvas) {
    console.error("Element chartKelembapan tidak ditemukan");
    return;
  }
  const ctx = canvas.getContext('2d');

  if (kelembapanChart) kelembapanChart.destroy();

  const labels = data.map(item => {
    const waktu = formatWaktuTanpaKonversi(item.waktu);
    return [waktu.tanggal, waktu.jam]; // dua baris
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
        x: {
          ticks: {
            callback: function(value, index) {
              const label = this.getLabelForValue(value);
              return Array.isArray(label) ? label : [label];
            }
          }
        },
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  });
}

async function ambilDataKelembapan(limit = 1) {
  const { data, error } = await supabase
    .from('log_kelembapan') // Tabel "data"
    .select('*')
    .order('waktu', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Gagal mengambil data kelembapan:', error.message);
    return [];
  }

  return data;
}

// Ambil data dari Supabase
async function fetchLatestData() {
  const data = await ambilDataKelembapan(1);
  if (data.length > 0) {
    const kelembapanSekarangEl = document.getElementById('kelembapanSekarang');
    kelembapanSekarangEl.textContent = `${data[0].kelembapan}%`;
  }
  
  const { data, error } = await supabase
    .from('data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Gagal mengambil data:', error.message);
    return;
  }
  // ⬇️ Ambil data dari tabel log_kelembapan untuk kelembapan terbaru & waktu
  const logKelembapan = await ambilDataKelembapan(1); // hanya ambil 1 data terbaru
  if (logKelembapan.length > 0) {
    const kelembapanSekarangEl = document.getElementById('kelembapanSekarang');
    if (kelembapanSekarangEl) {
      kelembapanSekarangEl.textContent = logKelembapan[0].kelembapan;
    } else {
      console.warn('Element kelembapanSekarang tidak ditemukan');
    }

    const waktuEl = document.getElementById('waktuPenyiraman');
    if (waktuEl) {
      const waktuTerakhir = formatWaktuTanpaKonversi(logKelembapan[0].waktu);
      waktuEl.textContent = `${waktuTerakhir.tanggal} ${waktuTerakhir.jam}`;
    } else {
      console.warn('Element waktuPenyiraman tidak ditemukan');
    }
  } 

  updateTabelKelembapan(data);
  updateChart(data);
}


// Jalankan awal dan setiap 5 detik
fetchLatestData();
setInterval(fetchLatestData, 5000);
