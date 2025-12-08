export default function KelembapanCard({ kelembapan, waktu }) {
  // Ubah waktu menjadi format lokal
  const formattedTime = waktu
    ? new Date(waktu).toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-lg p-6 text-center">
      <h2 className="text-xl font-semibold text-green-800 mb-1">
        Kelembapan Tanah Saat Ini
      </h2>
      <p className="text-6xl font-extrabold text-green-600 mt-2">
        {kelembapan ?? "--"}%
      </p>
      <p className="text-gray-600 text-sm mt-3 italic">{formattedTime}</p>
    </div>
  );
}
