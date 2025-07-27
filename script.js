const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let kelembapanChart;

function initChart() {
  const ctx = document.getElementById('chartKelembapan').getContext('2d');
  kelembapanChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
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
      animation: {
        duration: 800,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          labels: { color: '#4B5563' }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#4B5563',
            maxRotation: 0,
            callback(value) {
              const label = this.getLabelForValue(value);
              const [datePart, timePart] = label.split(' ');
              return [datePart, timePart];
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: { color: '#4B5563' }
        }
      }
    }
  });
}

async function ambilData() {
  try {
    const res = await fetch("/api/data"); // ganti endpoint jika perlu
    const data = await res.json();
    updateTabelKelembapan(data);
    tampilkanKelembapanSaatIni(data);
  } catch (err) {
    console.error("❌ Gagal mengambil data:", err);
  }
}

function konversiWaktuUTCkeWIB(waktuUTCString) {
  const waktuUTC = new Date(waktuUTCString);
  const waktuWIB = new Date(waktuUTC.getTime() + 7 * 60 * 60 * 1000); // tambah 7 jam

  const tanggal = waktuWIB.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit"
  });

  const jam = waktuWIB.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  return { tanggal, jam };
}

function updateTabelKelembapan(data) {
  const tbody = document.querySelector("#tabel-kelembapan tbody");
  tbody.innerHTML = "";

  const reversedData = [...data].reverse(); // agar no 1 adalah data terbaru

  reversedData.forEach((item, index) => {
    const { tanggal, jam } = konversiWaktuUTCkeWIB(item.waktu);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="border px-4 py-2 text-center">${index + 1}</td>
      <td class="border px-4 py-2 text-center">${item.kelembapan}%</td>
      <td class="border px-4 py-2 text-center">${item.metode}</td>
      <td class="border px-4 py-2 text-center">${item.durasi} detik</td>
      <td class="border px-4 py-2 text-center">${tanggal}</td>
      <td class="border px-4 py-2 text-center">${jam}</td>
    `;

    tbody.appendChild(tr);
  });
}

function tampilkanKelembapanSaatIni(data) {
  const kelembapanElem = document.getElementById("kelembapan");
  if (!kelembapanElem || data.length === 0) return;

  const dataTerbaru = data[data.length - 1];
  kelembapanElem.textContent = `${dataTerbaru.kelembapan}%`;
}


setInterval(() => {
  initChart();
  fetchLatestData();
  fetchChartData();
}, 5000);
