import express from "express";
import db from "./db.js";

const router = express.Router();

router.post("/check-availability", async (req, res) => {
    const { parkingId, entryTime, exitTime } = req.body;

    try {
        // Get total slots for the parking space
        const [totalSlotsResult] = await db.execute(
            `SELECT total_slots FROM parking_spaces WHERE parking_id = ?`, 
            [parkingId]
        );

        if (totalSlotsResult.length === 0) {
            return res.status(404).json({ error: "Parking space not found." });
        }

        const totalSlots = totalSlotsResult[0].total_slots;

        // Count the number of active bookings in the given time range
        const [bookedSlotsResult] = await db.execute(
            `SELECT COUNT(*) AS bookedSlots 
             FROM bookings 
             WHERE parking_id = ? 
             AND status = 'Active'
             AND (
                 (start_time BETWEEN ? AND ?)  
                 OR (end_time BETWEEN ? AND ?) 
                 OR (? BETWEEN start_time AND end_time)
             )`,
            [parkingId, entryTime, exitTime, entryTime, exitTime, entryTime]
        );

        const bookedSlots = bookedSlotsResult[0].bookedSlots;
        const availableSlots = totalSlots - bookedSlots;

        if (availableSlots > 0) {
            res.json({
                available: true,
                availableSlots,  // Sends the exact number of free slots
                message: `✅ ${availableSlots} slots available! Click 'Proceed' to book.`
            });
        } else {
            res.json({
                available: false,
                availableSlots: 0,
                message: "❌ No slots available for the selected time."
            });
        }
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
