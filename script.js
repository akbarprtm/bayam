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

// Fungsi update tabel kelembapan
function updateTabelKelembapan(data) {
  const tbody = document.getElementById('tabelKelembapan').querySelector('tbody');
  tbody.innerHTML = '';

  // Balik urutan data agar yang terbaru muncul di atas
  const reversedData = [...data].reverse();

  reversedData.forEach((item, index) => {
    const [tanggalPart, waktuPart] = item.waktu.split('T');
    const tanggal = tanggalPart.split('-').reverse().join('/'); // jadi 27/07/25
    const [jam, menit, detik] = waktuPart.split(':');
    const jamFormatted = `${jam}.${menit}.${detik.slice(0, 2)}`;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${tanggal}</td>
      <td>${jamFormatted}</td>
      <td>${item.kelembapan}</td>
      <td>${item.metode}</td>
      <td>${item.durasi_detik} detik</td>
    `;
    tbody.appendChild(row);
  });
}


// Fungsi update grafik Chart.js
function updateChart(data) {
  const ctx = document.getElementById('chartKelembapan').getContext('2d');

  if (kelembapanChart) kelembapanChart.destroy();

  // Ambil jam tanpa konversi ke zona waktu lain
  const labels = data.map(item => {
    const [tanggalPart, waktuPart] = item.waktu.split('T');
    const [jam, menit, detik] = waktuPart.split(':');
    return ${jam}:${menit}:${detik.slice(0, 2)};
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
        }
      }
    }
  });
}

// Fungsi fetch data terbaru
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

// Panggil saat pertama kali
fetchLatestData();

// Refresh otomatis setiap 5 detik
setInterval(fetchLatestData, 5000);
