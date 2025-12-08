import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function ChartKelembapan({ data }) {
  // Format label: tanggal dan waktu terpisah
  const labels = data?.map(d => {
    if (!d.waktu) return "--";
    const date = new Date(d.waktu);
    const tanggal = date.toLocaleDateString("id-ID"); // DD/MM/YYYY
    const waktu = date.toLocaleTimeString("id-ID"); // HH:MM:SS
    return `${tanggal}\n${waktu}`; // baris baru
  }) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Kelembapan (%)",
        data: data?.map(d => d.kelembapan) || [],
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Grafik Kelembapan Tanah" },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          callback: function(value) {
            // split label baris baru
            const label = this.getLabelForValue(value);
            return label.split("\n");
          }
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="h-64">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
