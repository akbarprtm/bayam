const SUPABASE_URL = 'https://ctggbrmvubjggyxmmbse.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0Z2dicm12dWJqZ2d5eG1tYnNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODI1MTg0NywiZXhwIjoyMDYzODI3ODQ3fQ.6rVGqPTOCkhI14R12cRVSQfH0uF7ywzQIC7Dm-vSrZA';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


  let kelembapanChart = null;

  // Format waktu ke lokal Indonesia
  function formatWaktuTanpaKonversi(waktuString) {
    const waktu = new Date(waktuString)
    const tanggal = waktu.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const jam = waktu.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    return { tanggal, jam }
  }

  // Ambil data dari tabel 'data' (untuk tabel HTML)
  async function fetchDataKelembapan() {
    const { data, error } = await supabase
      .from('data')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Gagal mengambil data kelembapan:', error.message)
      return
    }

    updateTabelKelembapan(data)
  }

  // Update tabel HTML
  function updateTabelKelembapan(data) {
    const tabelBody = document.getElementById('tabelKelembapan')
    if (!tabelBody) return

    tabelBody.innerHTML = ''

    data.forEach(row => {
      const waktu = formatWaktuTanpaKonversi(row.waktu)
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${waktu.tanggal}<br>${waktu.jam}</td>
        <td>${row.kelembapan}%</td>
      `
      tabelBody.appendChild(tr)
    })
  }

  // Ambil data dari log_kelembapan (untuk grafik)
  async function updateChartFromLog() {
    const { data, error } = await supabase
      .from('log_kelembapan')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Gagal mengambil data log untuk grafik:', error.message)
      return
    }

    const canvas = document.getElementById('chartKelembapan')
    if (!canvas) {
      console.error("Element chartKelembapan tidak ditemukan")
      return
    }
    const ctx = canvas.getContext('2d')

    if (kelembapanChart) kelembapanChart.destroy()

    const labels = data.map(item => {
      const waktu = formatWaktuTanpaKonversi(item.waktu)
      return [waktu.tanggal, waktu.jam]
    })

    const values = data.map(item => item.kelembapan)

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
          x: {
            ticks: {
              callback: function (value, index) {
                const label = this.getLabelForValue(value)
                return Array.isArray(label) ? label : [label]
              }
            }
          },
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    })
  }

  // Ambil kelembapan terbaru dari log untuk menampilkan di atas
  async function fetchDataLog() {
    const { data, error } = await supabase
      .from('log_kelembapan')
      .select('*')
      .order('waktu', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Gagal mengambil log penyiraman:', error.message)
      return
    }

    if (data.length > 0) {
      const { kelembapan, waktu } = data[0]
      const waktuFormat = formatWaktuTanpaKonversi(waktu)

      const elemenKelembapan = document.getElementById('kelembapanSekarang')
      const elemenWaktu = document.getElementById('waktuPenyiraman')

      if (elemenKelembapan) elemenKelembapan.textContent = `${kelembapan}%`
      if (elemenWaktu) elemenWaktu.innerHTML = `${waktuFormat.tanggal}<br>${waktuFormat.jam}`
    }
  }

  // Jalankan update berkala
  function startRealtimeFetch() {
    fetchDataKelembapan()
    fetchDataLog()
    updateChartFromLog()

    setInterval(() => {
      fetchDataKelembapan()
      fetchDataLog()
      updateChartFromLog()
    }, 5000)
  }

  // Mulai saat halaman siap
  startRealtimeFetch()

}

startRealtimeFetch();
