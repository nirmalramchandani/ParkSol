document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent page reload

  const location = document.querySelector("#searchInput").value.trim();

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ location: encodeURIComponent(location) }),
    });

    const data = await response.json();
    let resultsHtml = `<div class="avl-lots"><h2>Available parking Spaces</h2>`;

    if (data.length === 0) {
      resultsHtml += `<p>No parking spaces found. Try a different location.</p>`;
    } else {
      data.forEach((parking) => {
        resultsHtml += `<button class="lot" data-id="${parking.parking_id}">
          <div class="lot-name"><strong>${parking.lot_name}</strong></div>
          <div class="lot-address">${parking.address}, ${parking.city}, ${parking.state}</div>
          <div class="lot-timing"><strong>Open Hours:</strong> 6am - 10pm</div>
          <div class="lot-type"><strong>Vehicle Type :</strong> Two wheelers</div>
        </button>`;
      });
    }

    resultsHtml += `</div>`;
    document.getElementById("results").innerHTML = resultsHtml;
    document.getElementById("searchCard").classList.add("expanded");
  } catch (error) {
    console.error("Error:", error);
  }
});

// ✅ Event delegation for dynamically added buttons
document.getElementById("results").addEventListener("click", (event) => {
  if (event.target.closest(".lot")) {
    const parkingId = event.target.closest(".lot").getAttribute("data-id");
    window.location.href = `/parking/${parkingId}`;
  }
});
