import express from "express";
import db from "./db.js";

const router = express.Router();

// 🚀 Route to register parking
router.post("/register-parking", async (req, res) => {
    const {
        full_name,
        phone,
        email,
        id_proof,
        lot_name,
        address,
        total_slots,
        city,
        state,
        pincode,
        area,
        slot_pricing, // Array of { slot_type, hourly_rate, daily_rate }
        facilities, // Object { cctv, security_guard, ev_charging, covered_parking, availability }
        terms_accepted
    } = req.body;

    if (!terms_accepted || terms_accepted !== "Yes") {
        return res.status(400).json({ message: "You must accept the terms & conditions." });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // ✅ Insert into `parking_owners`
        const [ownerResult] = await connection.execute(
            "INSERT INTO parking_owners (full_name, phone, email, id_proof, registered_at) VALUES (?, ?, ?, ?, NOW())",
            [full_name, phone, email, id_proof]
        );
        const owner_id = ownerResult.insertId;

        // ✅ Insert into `parking_spaces`
        const [parkingResult] = await connection.execute(
            "INSERT INTO parking_spaces (owner_id, lot_name, address, total_slots, city, state, pincode, area) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [owner_id, lot_name, address, total_slots, city, state, pincode, area]
        );
        const parking_id = parkingResult.insertId;

        // ✅ Insert into `slot_pricing`
        for (const slot of slot_pricing) {
            if (slot.hourly_rate || slot.daily_rate) {
                await connection.execute(
                    "INSERT INTO slot_pricing (parking_id, slot_type, hourly_rate, daily_rate) VALUES (?, ?, ?, ?)",
                    [parking_id, slot.slot_type, slot.hourly_rate || 0, slot.daily_rate || 0]
                );
            }
        }

        // ✅ Insert into `parking_facilities`
        await connection.execute(
            "INSERT INTO parking_facilities (parking_id, cctv, security_guard, ev_charging, covered_parking, availability) VALUES (?, ?, ?, ?, ?, ?)",
            [parking_id, facilities.cctv, facilities.security_guard, facilities.ev_charging, facilities.covered_parking, facilities.availability]
        );

        await connection.commit();
        res.status(201).json({ message: "Parking registered successfully!" });
    } catch (error) {
        await connection.rollback();
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    } finally {
        connection.release();
    }
});

export default router;
