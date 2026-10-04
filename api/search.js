
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Metode tidak diizinkan"
    });
  }

  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({
      success: false,
      message: "Stasiun asal, tujuan, dan tanggal wajib diisi"
    });
  }

  if (origin.toLowerCase() === destination.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: "Stasiun asal dan tujuan tidak boleh sama"
    });
  }

  return res.status(200).json({
    success: true,
    project: "Rexpress",
    search: {
      origin,
      destination,
      date
    },
    data: [],
    message: "Permintaan pencarian berhasil diterima. Data jadwal KAI belum terhubung."
  });
}
