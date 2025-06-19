const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
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
                  const [date, time] = label.split(' ');
                  return [date, time];
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
          timeZone: 'Asia/Jakarta',
          day: '2-digit', month: '2-digit', year: '2-digit',
          hour: '2-digit', minute: '2-digit',
          hour12: false
        });
        document.getElementById('waktuPenyiraman').textContent = waktu + ' WIB';
      }
    }

    async function fetchChartData() {
      const { data } = await supabase
        .from('sensor_data')
        .select('*')
        .order('waktu', { ascending: false })
        .limit(7);

      if (data) {
        const reversed = data.reverse();
        kelembapanChart.data.labels = reversed.map(item => {
          const waktu = new Date(item.waktu);
          const tanggal = waktu.toLocaleDateString('id-ID', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            timeZone: 'Asia/Jakarta'
          });
          const jam = waktu.toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit',
            hour12: false,
            timeZone: 'Asia/Jakarta'
          });
          return `${tanggal} ${jam}`;
        });

        kelembapanChart.data.datasets[0].data = reversed.map(item => item.kelembapan);
        kelembapanChart.update();
      }
    }

    // Auto-refresh setiap 5 detik
    setInterval(() => {
      fetchLatestData();
      fetchChartData();
      console.log('🔄 Auto-refresh 5 detik...');
    }, 5000);

    // Inisialisasi awal
    initChart();
    fetchLatestData();
    fetchChartData();
