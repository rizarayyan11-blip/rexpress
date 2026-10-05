export default async function handler(req, res) {
  const { origin, destination, date } = req.query;

  // Validasi input
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

  // UID resmi KAI disimpan di Environment Variable Vercel
  const kaiUid = process.env.KAI_UID;

  if (!kaiUid) {
    return res.status(503).json({
      success: false,
      message: "KAI API belum dikonfigurasi."
    });
  }

  // Endpoint Get Schedule KAI
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

    // Periksa response dari KAI
    if (!response.ok || result.code !== "00") {
      return res.status(response.status || 502).json({
        success: false,
        message: result.message || "Gagal mengambil jadwal KAI."
      });
    }

    // Ubah payload KAI menjadi format yang dibutuhkan renderTrains()
    const trains = (result.payload || []).map((item) => {

      // Ambil harga penumpang dewasa
      const adultFare = Array.isArray(item.fares)
        ? item.fares.find(
            (fare) => fare.passengertype === "A"
          )
        : null;

      // Hitung durasi perjalanan
      let duration = "Durasi belum tersedia";

      if (item.departdatetime && item.arrivaldatetime) {
        const departure = new Date(
          item.departdatetime.replace(" ", "T")
        );

        const arrival = new Date(
          item.arrivaldatetime.replace(" ", "T")
        );

        const minutes = Math.round(
          (arrival - departure) / 60000
        );

        if (minutes >= 0) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;

          duration =
            hours > 0
              ? `${hours} jam ${mins} menit`
              : `${mins} menit`;
        }
      }

      // Format ketersediaan kursi
      let availability = "Ketersediaan belum diketahui";

      if (typeof item.availability === "number") {
        availability =
          item.availability > 0
            ? `${item.availability} kursi tersedia`
            : "Tiket tidak tersedia";
      }

      // Format kelas
      const classNames = {
        EKS: "Eksekutif",
        BIS: "Bisnis",
        EKO: "Ekonomi"
      };

      const trainClass =
        classNames[item.wagonclasscode] ||
        item.wagonclasscode ||
        "Kelas belum tersedia";

      return {
        name: item.trainname || "Nama kereta tidak tersedia",
        class: trainClass,

        departure: formatTime(item.departuretime),
        origin: item.stasiunorgcode || "",

        arrival: formatTime(item.arrivaltime),
        destination: item.stasiundestcode || "",

        duration,
        availability,

        price: adultFare
          ? Number(adultFare.amount)
          : null,

        number: item.noka || "",
        tripId: item.tripid || ""
      };
    });

    return res.status(200).json({
      success: true,
      trains
    });

  } catch (error) {
    console.error("KAI API error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal menghubungi API KAI."
    });
  }
}


// Mengubah "1400" menjadi "14:00"
function formatTime(time) {
  if (!time || time.length !== 4) {
    return "--:--";
  }

  return `${time.slice(0, 2)}:${time.slice(2, 4)}`;
}
