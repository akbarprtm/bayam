import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(
  'https://ctggbrmvubjggyxmmbse.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA'
);

let kelembapanChart;

function initChart() {
  const ctx = document.getElementById('chartKelembapan').getContext('2d');
  kelembapanChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Kelembapan (%)', data: [], fill: true, borderColor: 'rgb(34,197,94)', backgroundColor: 'rgba(34,197,94,0.2)', tension: 0.3 }] },
    options: {
      responsive: true,
      animation: { duration: 800, easing: 'easeInOutQuart' },
      plugins: { legend: { labels: { color: '#4B5563' } } },
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
        y: { beginAtZero: true, ticks: { color: '#4B5563' } }
      }
    }
  });
}

async function fetchLatestData() {
  const { data } = await supabase.from('data').select('*').order('waktu', { ascending: false }).limit(1);
  if (data?.length) {
    document.getElementById('kelembapan').textContent = data[0].kelembapan + '%';
    const waktu = new Date(data[0].waktu).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    document.getElementById('waktuPenyiraman').textContent = waktu + ' WIB';
  }
}

function updateTabelKelembapan(data) {
  const tbody = document.querySelector('#tabelKelembapan tbody');
  tbody.innerHTML = '';
  data.forEach(item => {
    const waktu = new Date(item.waktu);
    const tanggal = waktu.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    const jam = waktu.toLocaleTimeString('id-ID', { hour12: false, timeZone: 'Asia/Jakarta' });
    tbody.innerHTML += `
      <tr class="border-t">
        <td class="px-4 py-2">${tanggal}</td>
        <td class="px-4 py-2">${jam}</td>
        <td class="px-4 py-2">${item.kelembapan}%</td>
        <td class="px-4 py-2">${item.durasi || 0}</td>
        <td class="px-4 py-2">${item.metode}</td>
      </tr>`;
  });
}

async function fetchChartData() {
  const jumlah = parseInt(document.getElementById('jumlahData')?.value) || 7;
  const { data } = await supabase.from('data').select('*').order('waktu', { ascending: false }).limit(jumlah);
  if (data?.length) {
    const reversed = data.reverse();
    kelembapanChart.data.labels = reversed.map(item => {
      const waktu = new Date(item.waktu);
      return waktu.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    });
    kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
    kelembapanChart.update();
    updateTabelKelembapan(reversed);
  }
}

function unduhCSV() {
  const rows = document.querySelectorAll("#tabelKelembapan tr");
  let csv = [];
  for (const row of rows) {
    const cols = row.querySelectorAll("td, th");
    const rowData = [...cols].map(col => '"' + col.innerText.replace(/"/g, '""') + '"');
    csv.push(rowData.join(","));
  }
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "data_kelembapan.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

setInterval(() => {
  fetchLatestData();
  fetchChartData();
}, 5000);
