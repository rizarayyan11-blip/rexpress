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

  const kaiUid = process.env.KAI_UID;

  // Belum ada UID resmi KAI
  if (!kaiUid) {
    return res.status(503).json({
      success: false,
      message: "KAI API belum dikonfigurasi.",
      detail: "KAI_UID belum tersedia di environment variable."
    });
  }

  const kaiUrl =
    `https://resapib2bdev.kai.id/apieks/info/get_schedule/` +
    `${encodeURIComponent(origin)}/` +
    `${encodeURIComponent(destination)}/` +
    `${encodeURIComponent(date)}`;

  try {
    const response = await fetch(kaiUrl, {
      method: "GET",
      headers: {
        uid: kaiUid
      }
    });

    const data = await response.json();

    return res.status(response.status).json({
      success: response.ok,
      data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghubungi API KAI.",
      error: error.message
    });
  }
}
