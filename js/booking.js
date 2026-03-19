let current = 0;
let phases = document.querySelectorAll(".phase");

document.querySelectorAll(".next").forEach(btn => {
    btn.addEventListener("click", () => {
        saveData();
        phases[current].classList.remove("active");
        current++;
        phases[current].classList.add("active");

        if (current === 5) showReview();
    });
});

function saveData() {
    let data = {
        cleaners: document.getElementById("cleaners")?.value,
        hours: document.getElementById("hours")?.value,
        frequency: document.getElementById("frequency")?.value,
        materials: document.getElementById("materials")?.value,
        instructions: document.getElementById("instructions")?.value,
        date: document.getElementById("date")?.value,
        time: document.getElementById("time")?.value,
        fname: document.getElementById("fname")?.value,
        lname: document.getElementById("lname")?.value,
        email: document.getElementById("email")?.value,
    };

    localStorage.setItem("bookingData", JSON.stringify(data));
    updateSummary(data);
}

function updateSummary(data) {
    let summary = `
        Cleaners: ${data.cleaners}<br>
        Hours: ${data.hours}<br>
        Frequency: ${data.frequency}<br>
        Materials: ${data.materials}<br>
        Date: ${data.date}<br>
        Time: ${data.time}
    `;
    document.getElementById("summary").innerHTML = summary;
}

function showReview() {
    let data = JSON.parse(localStorage.getItem("bookingData"));
    document.getElementById("review").innerHTML = `
        <strong>Name:</strong> ${data.fname} ${data.lname}<br>
        <strong>Email:</strong> ${data.email}<br>
        <strong>Service:</strong> ${data.cleaners} cleaners for ${data.hours} hours
    `;
}

/* Dynamic Address Fields */
document.getElementById("propertyType").addEventListener("change", function() {
    let type = this.value;
    let box = document.getElementById("addressFields");

    if(type === "Office") {
        box.innerHTML = `
            <input class="form-control mb-2" placeholder="City">
            <input class="form-control mb-2" placeholder="Building Name">
            <input class="form-control mb-2" placeholder="Office Name">
            <input class="form-control mb-2" placeholder="Office Number">
        `;
    } else {
        box.innerHTML = `
            <input class="form-control mb-2" placeholder="City">
            <input class="form-control mb-2" placeholder="House/Apartment Name">
        `;
    }
});

/* Submit */
document.getElementById("bookingForm").addEventListener("submit", function(e){
    e.preventDefault();
    alert("Booking Completed Successfully!");
});