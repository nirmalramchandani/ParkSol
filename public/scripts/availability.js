document
  .getElementById("availabilityForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const entryTime = document.getElementById("entryTime").value;
    const exitTime = document.getElementById("exitTime").value;
    const parkingId = window.location.pathname.split("/").pop();

    console.log("Sending request to server:", {
      parkingId,
      entryTime,
      exitTime,
    });

    fetch("/api/check-availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parkingId, entryTime, exitTime }),
    })
      .then((response) => response.json())
      .then((data) => {

        const message = document.getElementById("availability-message");
        const proceedButton = document.getElementById("proceed-btn");

        if (!message || !proceedButton) {
          console.error(
            "Error: 'availability-message' or 'proceed-btn' element not found!"
          );
          return;
        }

        if (data.available) {
          message.textContent = `✅ ${data.availableSlots} slots available! Click 'Proceed' to book.`;
          message.style.color = "green";
          proceedButton.style.display = "block"; // Show Proceed button
        } else {
          message.textContent = "❌ No slots available for the selected time.";
          message.style.color = "red";
          proceedButton.style.display = "none"; // Hide Proceed button
        }
      })
      .catch((error) => console.error("Error:", error));
  });

function proceedToBooking() {
  const entryTime = document.getElementById("entryTime").value;
  const exitTime = document.getElementById("exitTime").value;
  const parkingId = window.location.pathname.split("/").pop();

  window.location.href = `/book-parking?parkingId=${parkingId}&entryTime=${entryTime}&exitTime=${exitTime}`;
}
