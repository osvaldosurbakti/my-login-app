// models/Debt.js
import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Referensi ke user yang punya utang

  description: { type: String, required: true },  // Deskripsi utang
  amount: { type: Number, required: true },       // Nominal utang
  date: { type: Date, default: Date.now },        // Tanggal utang dibuat
  dueDate: { type: Date },                        // Tanggal jatuh tempo (opsional)
  status: { 
    type: String, 
    enum: ["unpaid", "paid"], 
    default: "unpaid" 
  }, // Status utang
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Debt", debtSchema);

// Tidak, model ini hanya untuk data utang (Debt), bukan transaksi barang.
// Jika aplikasi Anda tidak menggunakan fitur utang terpisah, file ini tidak mempengaruhi transaksi barang.
// Pastikan model transaksi/barang Anda yang digunakan untuk fitur dashboard dan transaksi.
