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
