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

  if (!kaiUid) {
    return res.status(503).json({
      success: false,
      message: "KAI API belum dikonfigurasi."
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

    const result = await response.json();

    if (!response.ok || result.code !== "00") {
      return res.status(response.status || 502).json({
        success: false,
        message: result.message || "Gagal mengambil jadwal KAI."
      });
    }

    const trains = (result.payload || []).map((item) => {
      const fare = item.fares?.find(
        (fare) => fare.passengertype === "A"
      );

      return {
        name: item.trainname,
        number: item.noka,
        origin: item.stasiunorgcode,
        destination: item.stasiundestcode,
        departure: item.departuretime,
        arrival: item.arrivaltime,
        departureDate: item.departdate,
        arrivalDate: item.arrivaldate,
        class: item.wagonclasscode,
        availability: item.availability,
        price: fare ? Number(fare.amount) : null
      };
    });

    return res.status(200).json({
      success: true,
      trains
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghubungi API KAI."
    });
  }
}
