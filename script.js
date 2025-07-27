const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Fungsi ubah waktu UTC ke WIB
function formatWaktuKeWIB(utcString) {
  return new Date(utcString).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
}

// Update tabel
function updateTabelKelembapan(data) {
  const tbody = document.getElementById('tabelKelembapan');
  tbody.innerHTML = '';

  data.slice().reverse().forEach((item, index) => {
    const waktuWIB = formatWaktuKeWIB(item.waktu).split(', ');
    const tanggal = waktuWIB[0];
    const jam = waktuWIB[1];

    const durasi = item.durasi_detik || 0;
    const metode = item.metode === 'manual' ? 'Manual' :
                   item.metode === 'otomatis' ? 'Otomatis' : '-';

    tbody.innerHTML += `
      <tr class="border-t">
        <td class="px-4 py-2 text-center">${index + 1}</td>
        <td class="px-4 py-2">${tanggal}</td>
        <td class="px-4 py-2">${jam}</td>
        <td class="px-4 py-2">${item.kelembapan}%</td>
        <td class="px-4 py-2">${durasi}</td>
        <td class="px-4 py-2">${metode}</td>
      </tr>
    `;
  });
}

// Inisialisasi chart
const ctx = document.getElementById('kelembapanChart').getContext('2d');
const kelembapanChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Kelembapan (%)',
      data: [],
      borderColor: 'green',
      backgroundColor: 'rgba(34,197,94,0.1)',
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: 100
      }
    }
  }
});

// Ambil data dari Supabase
async function fetchChartData() {
  try {
    const jumlah = parseInt(document.getElementById('jumlahData')?.value) || 7;

    const { data } = await supabase
      .from('data')
      .select('*')
      .order('waktu', { ascending: true })
      .limit(jumlah);

    if (data?.length) {
      const reversed = data.slice().reverse();

      kelembapanChart.data.labels = reversed.map(item => {
        return formatWaktuKeWIB(item.waktu);
      });

      kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
      kelembapanChart.update();

      updateTabelKelembapan(reversed);

      // Update kelembapan saat ini
      document.getElementById('kelembapan').textContent = data[data.length - 1].kelembapan + '%';
      document.getElementById('waktuPenyiraman').textContent = formatWaktuKeWIB(data[data.length - 1].waktu) + ' WIB';
    }
  } catch (error) {
    console.error('Gagal fetch data chart:', error);
  }
}

// Panggil pertama kali
fetchChartData();
