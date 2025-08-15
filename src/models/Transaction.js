// src/models/Transaction.js
import { ObjectId } from "mongodb";

export default class Transaction {
  constructor({ userId, itemId, itemName, price, quantity, total, date, note, status }) {
    this.userId = userId;
    this.itemId = itemId || null; // optional
    this.itemName = itemName || ""; // bisa manual
    this.price = price;
    this.quantity = quantity;
    this.total = total;
    if (date instanceof Date) {
      this.date = date;
    } else if (typeof date === "string") {
      this.date = new Date(date);
    } else {
      this.date = new Date();
    }
    this.note = note || "";
    this.status = status || "Belum Lunas"; // default
  }
}
