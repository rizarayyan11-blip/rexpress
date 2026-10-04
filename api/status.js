export default function handler(req, res) {
  res.status(200).json({
    status: "online",
    project: "Rexpress",
    message: "Backend Rexpress berhasil berjalan!",
    next: "Integrasi data resmi KAI"
  });
}
