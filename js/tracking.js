// Fake data (you can later connect to database)
const bookings = [
    { id: 1, status: "upcoming", service: "Home Cleaning", date: "2026-03-25" },
    { id: 2, status: "delivered", service: "Office Cleaning", date: "2026-03-10" },
    { id: 3, status: "cancelled", service: "Carpet Cleaning", date: "2026-03-05" }
];

const bookingList = document.getElementById("bookingList");
const tabs = document.querySelectorAll(".tab");

// Load default
loadBookings("upcoming");

// Tab click
tabs.forEach(tab => {
    tab.addEventListener("click", () => {

        document.querySelector(".tab.active").classList.remove("active");
        tab.classList.add("active");

        loadBookings(tab.dataset.type);
    });
});

// Function to load bookings
function loadBookings(type) {

    let filtered = bookings.filter(b => b.status === type);

    if(filtered.length === 0){
        bookingList.innerHTML = `
            <h5>No ${type} jobs!</h5>
            <p>You’re all caught up - nothing here.</p>
        `;
        return;
    }

    let html = "";

    filtered.forEach(b => {
        html += `
            <div class="card mb-3 text-start">
                <div class="card-body">
                    <h5>${b.service}</h5>
                    <p>Date: ${b.date}</p>
                    <p>Status: ${b.status}</p>
                </div>
            </div>
        `;
    });

    bookingList.innerHTML = html;
}