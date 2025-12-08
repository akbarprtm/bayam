import { useState } from "react";

export default function TabelPenyiraman({ data }) {
  const [jumlah, setJumlah] = useState(7);

  const unduhCSV = () => {
  // Header CSV
    let csv = [["No", "Tanggal", "Jam", "Kelembapan"]];

    data.slice(0, jumlah).forEach((row, i) => {
        const date = new Date(row.waktu);
        const tanggal = date.toLocaleDateString("id-ID"); // DD/MM/YYYY
        const jam = date.toLocaleTimeString("id-ID");     // HH:MM:SS

        csv.push([
        i + 1,
        tanggal,
        jam,
        row.kelembapan
        ]);
    });

    // Buat Blob CSV
    const csvFile = new Blob([csv.map(r => r.join(",")).join("\n")], { type: "text/csv" });

    // Buat link download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(csvFile);
    link.download = "data_kelembapan.csv";
    link.click();
    };


  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <h2 className="text-lg font-semibold text-gray-700 text-center md:text-left">Data Penyiraman Terbaru</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Jumlah data:</label>
          <input
            type="number"
            min="1"
            value={jumlah}
            onChange={(e) => setJumlah(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-center text-sm"
          />
          <button onClick={unduhCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
            Unduh CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="table-auto w-full mt-4 border-collapse border">
            <thead>
                <tr className="bg-gray-200 text-gray-700">
                <th className="border px-4 py-2">No</th>
                <th className="border px-4 py-2">Tanggal</th>
                <th className="border px-4 py-2">Jam</th>
                <th className="border px-4 py-2">Kelembapan</th>
                </tr>
            </thead>
            <tbody className="text-center text-gray-700 bg-white">
                {data.slice(0, jumlah).map((row, i) => {
                // Format tanggal dan jam dari row.waktu
                const date = new Date(row.waktu);

                // Tanggal tetap lokal
                const tanggal = date.toLocaleDateString("id-ID"); // DD/MM/YYYY

                // Jam manual pakai ":" sebagai separator
                const jam = [
                date.getHours().toString().padStart(2, "0"),
                date.getMinutes().toString().padStart(2, "0"),
                date.getSeconds().toString().padStart(2, "0"),
                ].join(":");


                return (
                    <tr key={i}>
                    <td className="border px-4 py-2">{i + 1}</td>
                    <td className="border px-4 py-2">{tanggal}</td>
                    <td className="border px-4 py-2">{jam}</td>
                    <td className="border px-4 py-2">{row.kelembapan}</td>
                    </tr>
                );
                })}
            </tbody>
            </table>

      </div>
    </div>
  );
}
