// Ganti dengan kredensial Supabase kamu (hindari expose PUBLIC KEY di frontend production)
const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'PUBLIC_ANON_KEY_HANYA_BOLEH_DIGUNAKAN_JIKA_TIDAK_SENSITIF';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let kelembapanChart;

// Inisialisasi ChartJS
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

// Ambil data terakhir
async function fetchLatestData() {
  try {
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

    if (kelembapan?.length) {
      document.getElementById('kelembapan').textContent = kelembapan[0].kelembapan + '%';
    }

    if (penyiraman?.length) {
      const waktu = new Date(penyiraman[0].waktu).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit',
        hour12: false, timeZone: 'Asia/Jakarta'
      });
      document.getElementById('waktuPenyiraman').textContent = waktu + ' WIB';
    }
  } catch (error) {
    console.error('Gagal fetch data terbaru:', error);
  }
}

// Perbarui isi tabel
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

    tabel.innerHTML += `
      <tr class="border-t">
        <td class="px-4 py-2">${tanggal}</td>
        <td class="px-4 py-2">${jam}</td>
        <td class="px-4 py-2">${item.kelembapan}%</td>
        <td class="px-4 py-2">${durasi}</td>
        <td class="px-4 py-2">${metode}</td>
      </tr>
    `;
  });
}

// Fungsi unduh CSV
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
  link.href = url;
  link.download = 'data_kelembapan.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Ambil data untuk grafik dan tabel
async function fetchChartData() {
  try {
    const jumlah = parseInt(document.getElementById('jumlahData')?.value) || 7;

    const { data: sensorData } = await supabase
      .from('sensor_data')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(jumlah);

    const { data: penyiramanData } = await supabase
      .from('penyiraman')
      .select('waktu, durasi_detik, metode')
      .order('waktu', { ascending: false })
      .limit(50);

    if (sensorData?.length) {
      const reversed = sensorData.reverse();

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
  } catch (error) {
    console.error('Gagal fetch data chart:', error);
  }
}

// Inisialisasi awal
initChart();
fetchLatestData();
fetchChartData();

// Auto refresh setiap 5 detik
setInterval(() => {
  fetchLatestData();
  fetchChartData();
}, 5000);
