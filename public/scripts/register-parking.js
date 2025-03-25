function submitForm() {
  const data = {
      full_name: document.getElementById("full_name").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      id_proof: document.getElementById("id_proof").value,
      lot_name: document.getElementById("lot_name").value,
      address: document.getElementById("address").value,
      total_slots: document.getElementById("total_slots").value,
      city: document.getElementById("city").value,
      state: document.getElementById("state").value,
      pincode: document.getElementById("pincode").value,
      area: document.getElementById("area").value,
      slot_pricing: [
          { slot_type: "Two-Wheeler", hourly_rate: document.getElementById("two_wheeler_hourly").value, daily_rate: document.getElementById("two_wheeler_daily").value },
          { slot_type: "Four-Wheeler", hourly_rate: document.getElementById("four_wheeler_hourly").value, daily_rate: document.getElementById("four_wheeler_daily").value },
          { slot_type: "Heavy Vehicles", hourly_rate: document.getElementById("heavy_vehicle_hourly").value, daily_rate: document.getElementById("heavy_vehicle_daily").value }
      ],
      facilities: {
          cctv: document.getElementById("cctv").value,
          security_guard: document.getElementById("security_guard").value,
          ev_charging: document.getElementById("ev_charging").value,
          covered_parking: document.getElementById("covered_parking").value,
          availability: document.getElementById("availability").value
      },
      payment_method: document.getElementById("payment_method").value,
      terms_accepted: document.getElementById("terms").checked ? "Yes" : "No"
  };
  fetch("http://localhost:3000/api/register-parking", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
  })
  .catch(error => {
      console.error("Error:", error);
  });
}