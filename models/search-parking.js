import express from "express";
import db from "./db.js";

const router = express.Router();

// Search Parking Route
router.post("/search", async (req, res) => {
  try {
    const query = req.body.location;
    if (!query) {
      return res.status(400).json({ error: "Location is required" });
    }

    const sql = `
      SELECT * FROM parking_spaces 
      WHERE address LIKE ? 
         OR area LIKE ?
         OR city LIKE ? 
         OR state LIKE ? 
         OR pincode LIKE ? 
         OR lot_name LIKE ?`;

    const [results] = await db.execute(sql, [
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
      `%${query}%`,
    ]);

    res.json(results);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
