import express from "express";
import db from "./db.js"; // Database connection
import axios from "axios"; // ✅ Used to call calculate-amount API

const router = express.Router();

// ✅ Booking Confirmation API
router.post("/confirm-booking", async (req, res) => {
  const { parkingId, userName, contact, vehicleNumber, vehicleType, entryTime, exitTime } = req.body;

  try {
    console.log("🔹 Confirming Booking for:", { parkingId, vehicleType, entryTime, exitTime });

    // ✅ Step 1: Fetch Amount from `calculate-amount.js`
    let amount;
    try {
      const amountResponse = await axios.post("http://localhost:3000/api/calculate-amount", {
        parkingId,
        vehicleType,
        entryTime,
        exitTime,
      });

      if (!amountResponse.data.success) {
        console.error("❌ Failed to fetch amount:", amountResponse.data.message);
        return res.status(400).json({ success: false, message: "Failed to calculate amount" });
      }

      amount = parseFloat(amountResponse.data.amount);

      if (isNaN(amount) || amount <= 0) {
        console.error("❌ Invalid amount received:", amount);
        return res.status(400).json({ success: false, message: "Invalid amount calculation" });
      }
    } catch (err) {
      console.error("❌ Error calling calculate-amount API:", err.message);
      return res.status(500).json({ success: false, message: "Error calculating amount" });
    }

    // ✅ Step 2: Insert Booking with Calculated Amount
    const [result] = await db.execute(
      `INSERT INTO bookings (parking_id, user_name, contact, vehicle_number, vehicle_type, start_time, end_time, status, amount) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
      [parkingId, userName, contact, vehicleNumber, vehicleType, entryTime, exitTime, amount]
    );

    const bookingId = result.insertId; // ✅ Get generated `booking_id`
    console.log("✅ Booking Confirmed! ID:", bookingId, "Amount:", amount);

    res.json({ success: true, bookingId, amount });
  } catch (error) {
    console.error("❌ Database Error:", error);
    res.status(500).json({ success: false, message: "Failed to save booking" });
  }
});

export default router;
