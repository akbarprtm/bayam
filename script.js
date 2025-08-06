const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let kelembapanChart = null;

function formatWaktuTanpaKonversi(isoString) {
  const [tanggalPart, waktuPart] = isoString.split('T');
  const [tahun, bulan, hari] = tanggalPart.split('-');
  const [jam, menit, detik] = waktuPart.split(':');
  return {
    tanggal: `${hari}/${bulan}/${tahun.slice(2)}`,
    jam: `${jam}.${menit}.${detik.slice(0, 2)}`
  };
}

function updateTabelKelembapan(data) {
  const tbody = document.getElementById('tabelKelembapan');
  if (!tbody) {
    console.error("Element tabelKelembapan tidak ditemukan");
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
    return [waktu.tanggal, waktu.jam];
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
}function updateChart(logData) {
  const canvas = document.getElementById('chartKelembapan');
  if (!canvas) {
    console.error("Element chartKelembapan tidak ditemukan");
    return;
  }
  const ctx = canvas.getContext('2d');

  // Hancurkan chart lama jika ada
  if (kelembapanChart) kelembapanChart.destroy();

  // Format label dan nilai dari tabel log_kelembapan
  const labels = logData.map(item => {
    const waktu = formatWaktuTanpaKonversi(item.waktu); // asumsikan waktu dalam format "YYYY-MM-DD HH:mm:ss"
    return [waktu.tanggal, waktu.jam]; // return array agar tampil 2 baris: tanggal dan jam
  });

  const values = logData.map(item => item.kelembapan);

  // Buat chart baru
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
              return Array.isArray(label) ? label : [label]; // tampilkan array label agar 2 baris
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

// Ambil data kelembapan (grafik + tabel) dari tabel 'data'
async function fetchDataKelembapan() {
  const { data, error } = await supabase
    .from('data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Gagal mengambil data kelembapan:', error.message);
    return;
  }

  updateTabelKelembapan(data);
  updateChart(data);
}

// Ambil data terbaru dari tabel 'log'
async function fetchDataLog() {
  const { data, error } = await supabase
    .from('log_kelembapan')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Gagal mengambil data log:', error.message);
    return;
  }

  if (data.length > 0) {
    const latest = data[0];

    const kelembapanSekarangEl = document.getElementById('kelembapanSekarang');
    const waktuPenyiramanEl = document.getElementById('waktuPenyiraman');

    if (kelembapanSekarangEl) {
      kelembapanSekarangEl.textContent = latest.kelembapan;
    }

    if (waktuPenyiramanEl) {
      const waktu = formatWaktuTanpaKonversi(latest.waktu);
      waktuPenyiramanEl.textContent = `${waktu.tanggal} ${waktu.jam}`;
    }
  }
}

// Jalankan saat halaman dimuat dan setiap 5 detik
function startRealtimeFetch() {
  fetchDataKelembapan();
  fetchDataLog();
  setInterval(() => {
    fetchDataKelembapan();
    fetchDataLog();
  }, 5000);
}

startRealtimeFetch(); 
