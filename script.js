// Ganti dengan kredensial Supabase-mu
const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Buat chart
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
            callback: function(value) {
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

// Ambil data terakhir untuk ditampilkan di card
async function fetchLatestData() {
  const { data: kelembapan } = await supabase
    .from('sensor_data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  const { data: penyiraman } = await supabase
    .from('penyiraman')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(1);

  if (kelembapan && kelembapan.length > 0) {
    document.getElementById('kelembapan').textContent = kelembapan[0].kelembapan + '%';
  }

  if (penyiraman && penyiraman.length > 0) {
    const waktu = new Date(penyiraman[0].waktu).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: false, timeZone: 'Asia/Jakarta'
    });
    document.getElementById('waktuPenyiraman').textContent = waktu + ' WIB';
  }
}

// Update tabel data kelembapan
function updateTabelKelembapan(data) {
  const tabel = document.getElementById('tabelKelembapan');
  tabel.innerHTML = '';

  data.forEach(item => {
    const waktu = new Date(item.waktu);
    const tanggal = waktu.toLocaleDateString('id-ID', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      timeZone: 'Asia/Jakarta'
    });
    const jam = waktu.toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Asia/Jakarta'
    });

    const durasi = item.durasi_detik || 0;
    const metode = item.metode === 'manual' ? 'Manual' :
                   item.metode === 'otomatis' ? 'Otomatis' : '-';

    const row = `
      <tr class="border-t">
        <td class="px-4 py-2">${tanggal}</td>
        <td class="px-4 py-2">${jam}</td>
        <td class="px-4 py-2">${item.kelembapan}%</td>
        <td class="px-4 py-2">${durasi}</td>
        <td class="px-4 py-2">${metode}</td>
      </tr>
    `;
    tabel.innerHTML += row;
  });
}

function unduhCSV() {
  const rows = [['Tanggal', 'Jam', 'Kelembapan (%)', 'Durasi (detik)', 'Metode']];
  const tabel = document.querySelectorAll('#tabelKelembapan tr');

  tabel.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = Array.from(cells).map(cell => cell.textContent);
    if (rowData.length) rows.push(rowData);
  });

  const csvContent = rows.map(e => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'data_kelembapan.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// Ambil 7 data terakhir untuk chart dan tabel
async function fetchChartData() {
  const jumlah = parseInt(document.getElementById('jumlahData')?.value) || 7;

  // Ambil data sensor
  const { data: sensorData } = await supabase
    .from('sensor_data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(jumlah);

  // Ambil data penyiraman
  const { data: penyiramanData } = await supabase
    .from('penyiraman')
    .select('waktu, durasi_detik, metode')
    .order('waktu', { ascending: false })
    .limit(50);

  if (sensorData) {
    const reversed = sensorData.reverse();

    // Update chart
    kelembapanChart.data.labels = reversed.map(item => {
      const waktu = new Date(item.waktu);
      const tanggal = waktu.toLocaleDateString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        timeZone: 'Asia/Jakarta'
      });
      const jam = waktu.toLocaleTimeString('id-ID', {
        hour: '2-digit', minute: '2-digit',
        hour12: false, timeZone: 'Asia/Jakarta'
      });
      return `${tanggal} ${jam}`;
    });

    kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
    kelembapanChart.update();

    // Gabungkan data penyiraman terdekat
    const gabungan = reversed.map(sensor => {
      const waktuSensor = new Date(sensor.waktu);
      const penyiramanTerdekat = penyiramanData.find(p => {
        const waktuPenyiraman = new Date(p.waktu);
        return Math.abs(waktuSensor - waktuPenyiraman) <= 5 * 60 * 1000; // ±5 menit
      });

      return {
        ...sensor,
        durasi_detik: penyiramanTerdekat?.durasi_detik ?? 0,
        metode: penyiramanTerdekat?.metode ?? '-',
      };
    });

    updateTabelKelembapan(gabungan);
  }
}



// Inisialisasi
initChart();
fetchLatestData();
fetchChartData();

// Refresh data setiap 5 detik
setInterval(async () => {
  await fetchLatestData();
  await fetchChartData();
}, 5000);
