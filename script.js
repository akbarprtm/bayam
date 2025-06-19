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
    const waktu = new Date(penyiraman[0].waktu).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: false, timeZone: 'Asia/Jakarta'
    });
    document.getElementById('waktuPenyiraman').textContent = waktu + ' WIB';
  }
}

// Ambil 7 data terakhir untuk chart
async function fetchChartData() {
  const { data, error } = await supabase
    .from('sensor_data')
    .select('*')
    .order('waktu', { ascending: false })
    .limit(7);

  if (data) {
    const reversed = data.reverse(); // supaya urut waktu naik
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
      return `${tanggal} ${jam}`; // format: dd/mm/yy hh:mm
    });

    kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
    kelembapanChart.update();
  }
}
async function fetchSensorTable(limit = 10) {
      const { data, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("waktu", { ascending: false })
        .limit(limit);

      if (error || !data) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-red-500 py-4">Gagal mengambil data</td></tr>`;
        return;
      }

      tbody.innerHTML = data
        .map(item => {
          const waktuObj = new Date(item.waktu);
          const waktuFormatted = waktuObj.toLocaleString("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "2-digit", month: "2-digit", year: "2-digit",
            hour: "2-digit", minute: "2-digit", second: "2-digit"
          });
          const detik = waktuObj.getSeconds().toString().padStart(2, '0');
          return `
            <tr>
              <td class="border px-4 py-2">${item.kelembapan}</td>
              <td class="border px-4 py-2">${waktuFormatted}</td>
              <td class="border px-4 py-2 text-center">${detik}</td>
            </tr>`;
        })
        .join("");
    }
function downloadCSVSensor(data) {
      if (!data || data.length === 0) {
        alert("Data kosong.");
        return;
      }

      const header = "Kelembapan,Waktu,Detik";
      const rows = data.map(row => {
        const waktu = new Date(row.waktu);
        const waktuStr = waktu.toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
        const detik = waktu.getSeconds();
        return `${row.kelembapan},${waktuStr},${detik}`;
      });

      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `sensor_data_${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    btnUnduh.addEventListener("click", async () => {
      const limit = parseInt(jumlahSelect.value);
      const { data, error } = await supabase
        .from("sensor_data")
        .select("*")
        .order("waktu", { ascending: false })
        .limit(limit);
      if (error) return alert("Gagal mengambil data");
      downloadCSVSensor(data);
    });

    jumlahSelect.addEventListener("change", () => {
      fetchSensorTable(parseInt(jumlahSelect.value));
    });


// Auto-refresh setiap 5 detik
    setInterval(() => {
      fetchLatestData();
      fetchChartData();
      console.log('🔄 Auto-refresh 5 detik...');
    }, 5000);

// Panggil awal
initChart();
fetchLatestData();
fetchChartData();
