export default async function handler(req, res) {
  const { origin, destination, date } = req.query;

  if (!origin || !destination || !date) {
    return res.status(400).json({
      success: false,
      message: "Asal, tujuan, dan tanggal wajib diisi."
    });
  }

  if (origin === destination) {
    return res.status(400).json({
      success: false,
      message: "Stasiun asal dan tujuan tidak boleh sama."
    });
  }

  // Persiapan endpoint resmi KAI B2B Get Schedule
  const kaiUrl =
    `https://resapib2bdev.kai.id/apieks/info/get_schedule/` +
    `${encodeURIComponent(origin)}/` +
    `${encodeURIComponent(destination)}/` +
    `${encodeURIComponent(date)}`;

  return res.status(200).json({
    success: true,
    message: "Endpoint Get Schedule KAI sudah disiapkan.",
    request: {
      origin,
      destination,
      date
    },
    kai_endpoint: kaiUrl
  });
}
