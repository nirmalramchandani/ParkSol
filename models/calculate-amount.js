import express from "express";
import db from "./db.js"; // Import the database connection

const router = express.Router();

router.post("/calculate-amount", async (req, res) => {
  try {
    const { parkingId, vehicleType, entryTime, exitTime } = req.body;

    // Fetch pricing details from `slot_pricing`
    const [pricing] = await db.execute(
      "SELECT hourly_rate, daily_rate FROM slot_pricing WHERE parking_id = ? AND slot_type = ?",
      [parkingId, vehicleType]
    );

    if (pricing.length === 0) {
      return res.status(404).json({ success: false, message: "Pricing not found" });
    }

    const { hourly_rate, daily_rate } = pricing[0];

    // Calculate duration in hours
    const [durationResult] = await db.execute(
      "SELECT TIMESTAMPDIFF(HOUR, ?, ?) AS duration",
      [entryTime, exitTime]
    );

    const duration = durationResult[0].duration;

    let amount;
    if (duration < 24) {
      amount = duration * hourly_rate;
    } else {
      amount = Math.ceil(duration / 24) * daily_rate;
    }

    res.json({ success: true, amount });
  } catch (error) {
    console.error("Error calculating amount:", error);
    res.status(500).json({ success: false, message: "Server error!" });
  }
});

export default router;
