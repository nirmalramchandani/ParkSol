import express from "express";
import bodyParser from "body-parser";
import db from "./models/db.js";
import searchParkingRoutes from "./models/search-parking.js";
import availabilityRoutes from "./models/parking-avl.js";
import bookingRoutes from "./models/booking.js";
import parkingRegistrationRoutes from "./models/register-parking.js";
import calculateAmountRoutes from "./models/calculate-amount.js"
import paymentRoutes from "./models/payment.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", searchParkingRoutes); 
app.use("/api", availabilityRoutes);
app.use("/api", parkingRegistrationRoutes);
app.use("/api", bookingRoutes);
app.use("/api", calculateAmountRoutes);
app.use("/api", paymentRoutes);

// Render Home Page
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// Render About Us Page
app.get("/aboutus", (req, res) => {
  res.render("aboutus.ejs");
});

// Render Register Page
app.get("/register-parking", (req, res) => {
  res.render("register-parking.ejs");
});

app.get("/parking/:id", async (req, res) => {
  const parkingId = req.params.id;

  try {
    const [rows] = await db.query(
      "SELECT * FROM parking_spaces WHERE parking_id = ?",
      [parkingId]
    );

    if (rows.length > 0) {
      res.render("parking-details", { parking: rows[0] });
    } else {
      res.status(404).send("Parking lot not found");
    }
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).send("Server error");
  }
});

app.get("/book-parking", (req, res) => {
  res.render("book-parking.ejs");
});

app.get("/receipt", async (req, res) => {
  const bookingId = req.query.bookingId;

  if (!bookingId) {
      return res.status(400).send("Error: Booking ID is missing.");
  }

  try {
      // Fetch booking details from DB
      const [booking] = await db.execute(
          "SELECT * FROM bookings WHERE booking_id = ?",
          [bookingId]
      );

      if (booking.length === 0) {
          return res.status(404).send("Booking not found.");
      }

      const bookingDetails = booking[0];

      // Render receipt.ejs with fetched data
      res.render("receipt", {
          bookingId: bookingDetails.booking_id,
          userName: bookingDetails.user_name,
          vehicleType: bookingDetails.vehicle_type,
          vehicleNumber: bookingDetails.vehicle_number,
          parkingId: bookingDetails.parking_id,
          entryTime: bookingDetails.start_time,
          exitTime: bookingDetails.end_time,
          amount: bookingDetails.amount,
          paymentId: bookingDetails.payment_id || "N/A",
          paymentStatus: bookingDetails.payment_status || "Pending",
      });

  } catch (error) {
      console.error("❌ Database Error:", error);
      res.status(500).send("Server error.");
  }
});


// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
