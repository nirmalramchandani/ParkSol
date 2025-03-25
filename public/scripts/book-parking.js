document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const entryTime = urlParams.get("entryTime");
  const exitTime = urlParams.get("exitTime");

  document.getElementById("entryTime").textContent = entryTime;
  document.getElementById("exitTime").textContent = exitTime;
});

function showPreview() {
  const userName = document.getElementById("userName").value;
  const contact = document.getElementById("contact").value;
  const vehicleNumber = document.getElementById("vehicleNumber").value;
  const vehicleType = document.getElementById("vehicleType").value;
  const entryTime = document.getElementById("entryTime").textContent;
  const exitTime = document.getElementById("exitTime").textContent;
  const parkingId = new URLSearchParams(window.location.search).get(
    "parkingId"
  );

  if (!userName || !contact || !vehicleNumber || !vehicleType) {
    alert("Please fill in all details before proceeding.");
    return;
  }

  // Show "Calculating..." in the preview modal before fetching the amount
  document.getElementById("previewAmount").textContent = "Calculating...";

  // Fetch calculated amount before opening the preview modal
  fetch("http://localhost:3000/api/calculate-amount", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parkingId, vehicleType, entryTime, exitTime }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        document.getElementById(
          "previewAmount"
        ).textContent = `₹${data.amount}`;
      } else {
        document.getElementById("previewAmount").textContent =
          "Error calculating";
      }
    })
    .catch((error) => {
      console.error("Error fetching amount:", error);
      document.getElementById("previewAmount").textContent = "Error";
    });

  // Update other preview fields
  document.getElementById("previewUserName").textContent = userName;
  document.getElementById("previewContact").textContent = contact;
  document.getElementById("previewVehicleNumber").textContent = vehicleNumber;
  document.getElementById("previewVehicleType").textContent = vehicleType;
  document.getElementById("previewEntryTime").textContent = entryTime;
  document.getElementById("previewExitTime").textContent = exitTime;

  // Show the preview modal
  document.getElementById("previewModal").style.display = "block";
}

function closePreview() {
  document.getElementById("previewModal").style.display = "none";
}

async function confirmBooking() {
  const parkingId = new URLSearchParams(window.location.search).get("parkingId");
  const userName = document.getElementById("userName").value;
  const contact = document.getElementById("contact").value;
  const vehicleNumber = document.getElementById("vehicleNumber").value;
  const vehicleType = document.getElementById("vehicleType").value;
  const entryTime = document.getElementById("entryTime").textContent;
  const exitTime = document.getElementById("exitTime").textContent;

  if (!userName || !contact || !vehicleNumber || !vehicleType) {
    alert("Please fill in all details before proceeding.");
    return;
  }

  try {
    const response = await fetch("/api/confirm-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parkingId, userName, contact, vehicleNumber, vehicleType, entryTime, exitTime }),
    });

    const data = await response.json();

    if (data.success && data.bookingId) {
      startPayment(data.bookingId);
    } else {
      alert("Booking Failed: " + data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// ✅ Function to Start Razorpay Payment
async function startPayment(bookingId) {
  const response = await fetch("/api/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId }),
  });

  const data = await response.json();

  if (!data.success) {
    alert("Failed to create payment order. Try again.");
    return;
  }

  const options = {
    key: "rzp_test_j1vesG1VOweIb7", 
    amount: data.amount,
    currency: "INR",
    name: "Digital Parking System",
    description: "Parking Booking Payment",
    order_id: data.orderId,
    handler: async function (response) {
      const verifyRes = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          bookingId: bookingId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        alert(`✅ Payment Successful! Your Booking ID: #PS23${verifyData.bookingId}F`);
        window.location.href = `/receipt?bookingId=${verifyData.bookingId}`;
      } else {
        alert("❌ Payment failed. Try again.");
      }
    },
    theme: { color: "#E93F33" },
  };

  const rzp = new Razorpay(options);
  rzp.open();
}
