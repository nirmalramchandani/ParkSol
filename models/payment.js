import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import db from "./db.js"; // Database connection

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/create-order", async (req, res) => {
  try {
    const { bookingId } = req.body;
    console.log("🔹 Received Booking ID:", bookingId);

    // Check if bookingId is valid
    if (!bookingId) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    // ✅ Fetch booking amount from database
    const [booking] = await db.execute(
      "SELECT amount FROM bookings WHERE booking_id = ?",
      [bookingId]
    );

    if (booking.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    let amount = parseFloat(booking[0].amount) * 100; // Convert to paise

    console.log("🔹 Booking Amount (Paise):", amount);

    // ✅ Fix: Ensure minimum amount is 100 paise (₹1)
    if (amount < 100) {
      console.error("❌ Error: Amount is too low for Razorpay!");
      return res.status(400).json({ success: false, message: "Amount must be at least ₹1" });
    }

    // ✅ Create an order in Razorpay
    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order Created:", order);

    res.json({ success: true, orderId: order.id, amount });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ success: false, message: "Server error! Check logs." });
  }
});

// ✅ Verify Payment API
router.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = req.body;

    // ✅ Generate a hash signature to verify payment
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // ✅ Update booking status to "Paid"
    await db.execute(
      "UPDATE bookings SET payment_id = ?, payment_status = 'Paid' WHERE booking_id = ?",
      [razorpay_payment_id, bookingId]
    );

    // ✅ Return `bookingId` only if payment is successful
    res.json({ success: true, bookingId, message: "Payment successful! Booking confirmed." });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ success: false, message: "Server error! Check logs." });
  }
});

export default router;
