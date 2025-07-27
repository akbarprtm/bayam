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

function konversiWaktuUTCkeWIB(utcString) {
  const waktuUTC = new Date(utcString);
  const waktuWIB = new Date(waktuUTC.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

  const tanggal = waktuWIB.toLocaleDateString('id-ID', {
    day: '2-digit', month: '2-digit', year: '2-digit'
  });

  const jam = waktuWIB.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false
  });

  return { tanggal, jam };
}

async function fetchLatestData() {
  try {
    const { data } = await supabase
      .from('data')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(1);

    if (data?.length) {
      document.getElementById('kelembapan').textContent = data[0].kelembapan + '%';

      const waktuUTC = new Date(data[0].waktu);
      const waktuWIB = new Date(waktuUTC.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));

      const waktu = waktuWIB.toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      document.getElementById('waktuPenyiraman').textContent = waktu + ' WIB';
    }
  } catch (error) {
    console.error('Gagal fetch data terbaru:', error);
  }
}

function updateTabelKelembapan(data) {
  const tbody = document.querySelector("#tabel-kelembapan tbody");
  tbody.innerHTML = "";

  const reversedData = [...data].reverse();

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

async function fetchChartData() {
  try {
    const jumlah = parseInt(document.getElementById('jumlahData')?.value) || 7;

    const { data } = await supabase
      .from('data')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(jumlah);

    if (data?.length) {
      const reversed = data.reverse();

      kelembapanChart.data.labels = reversed.map(item => {
        const { tanggal, jam } = konversiWaktuUTCkeWIB(item.waktu);
        return `${tanggal} ${jam}`;
      });

      kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
      kelembapanChart.update();

      updateTabelKelembapan(reversed);
    }
  } catch (error) {
    console.error('Gagal fetch data chart:', error);
  }
}

initChart();
fetchLatestData();
fetchChartData();
setInterval(() => {
  fetchLatestData();
  fetchChartData();
}, 5000);
