import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Header from "./components/Header";
import KelembapanCard from "./components/KelembapanCard";
import ChartKelembapan from "./components/ChartKelembapan";
import TabelPenyiraman from "./components/TabelPenyiraman";

export default function App() {
  const [sensorData, setSensorData] = useState([]);
  const [penyiramanData, setPenyiramanData] = useState([]);
  const [currentKelembapan, setCurrentKelembapan] = useState(null); // <-- data terbaru
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Ambil data sensor_data untuk grafik
    const { data: sensor, error: e1 } = await supabase
      .from("log_kelembapan")
      .select("*")
      .order("waktu", { ascending: false })
      .limit(10);
    if (e1) console.log(e1); else setSensorData(sensor);

    // Ambil data terbaru untuk KelembapanCard dari log_kelembapan
    const { data: latest, error: e2 } = await supabase
      .from("log_kelembapan")
      .select("*")
      .order("waktu", { ascending: false })
      .limit(1);
    if (e2) console.log(e2); else setCurrentKelembapan(latest[0]);

    // Ambil data penyiraman untuk tabel
    const { data: penyiraman, error: e3 } = await supabase
      .from("log_kelembapan")
      .select("*")
      .order("waktu", { ascending: false })
      .limit(10);
    if (e3) console.log(e3); else setPenyiramanData(penyiraman);

    setLoading(false);
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <Header />
        {/* Kelembapan tanah saat ini */}
        <KelembapanCard 
          kelembapan={currentKelembapan?.kelembapan} 
          waktu={currentKelembapan?.waktu} 
        />
        {/* Grafik sensor_data */}
        <ChartKelembapan data={sensorData} />
        {/* Tabel penyiraman */}
        <TabelPenyiraman data={penyiramanData} />
      </div>
    </div>
  );
}
