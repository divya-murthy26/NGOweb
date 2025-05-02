document.addEventListener("DOMContentLoaded", function () {
    // Firebase is already initialized in calendar.html
    const db = firebase.firestore();
    const auth = firebase.auth();

    // === DOM Elements ===
    const calendarDays = document.getElementById("calendarDays");
    const currentMonth = document.getElementById("currentMonth");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const eventList = document.getElementById("eventList");
    const eventPopup = document.getElementById("eventPopup");
    const eventTitleInput = document.getElementById("eventTitle");
    const eventDateInput = document.getElementById("eventDate");
    const saveEventBtn = document.getElementById("saveEvent");
    const cancelEventBtn = document.getElementById("cancelEvent");
    const logoutBtn = document.getElementById("logoutBtn");

    const events = {};
    let date = new Date();
    let currentUserId = null;

    // === Authentication Check ===
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid;
            loadEvents();
        } else {
            alert("Please log in to use the calendar.");
            window.location.href = "login.html";
        }
    });

    // === Render Calendar ===
    function renderCalendar() {
        calendarDays.innerHTML = "";
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

        currentMonth.textContent = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

        for (let i = 0; i < firstDay; i++) {
            const emptyDiv = document.createElement("div");
            calendarDays.appendChild(emptyDiv);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dayDiv = document.createElement("div");
            const eventDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            dayDiv.textContent = day;
            dayDiv.classList.add("calendar-day");

            if (events[eventDate]) {
                dayDiv.classList.add("event-day");
            }

            dayDiv.addEventListener("click", function () {
                eventDateInput.value = eventDate;
                eventTitleInput.value = events[eventDate] ? events[eventDate].title : "";
                eventPopup.style.display = "block";
            });

            calendarDays.appendChild(dayDiv);
        }

        updateEventList();
    }

    // === Load Events from Firestore ===
    function loadEvents() {
        db.collection("events")
            .where("userId", "==", currentUserId)
            .get()
            .then(snapshot => {
                for (const doc of snapshot.docs) {
                    const data = doc.data();
                    events[data.date] = {
                        title: data.title,
                        docId: doc.id
                    };
                }
                renderCalendar();
            });
    }

    // === Update Event List ===
    function updateEventList() {
        eventList.innerHTML = "";
        for (let eventDate in events) {
            const li = document.createElement("li");
            li.textContent = `${events[eventDate].title} - ${eventDate}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", function () {
                const docId = events[eventDate].docId;
                db.collection("events").doc(docId).delete().then(() => {
                    delete events[eventDate];
                    renderCalendar();
                });
            });

            li.appendChild(deleteBtn);
            eventList.appendChild(li);
        }
    }

    // === Save Event ===
    saveEventBtn.addEventListener("click", function () {
        const title = eventTitleInput.value.trim();
        const selectedDate = eventDateInput.value;

        if (!title || !selectedDate || !currentUserId) {
            alert("Please enter both event title and date.");
            return;
        }

        if (events[selectedDate]) {
            // Update existing event
            db.collection("events").doc(events[selectedDate].docId).update({
                title: title
            }).then(() => {
                events[selectedDate].title = title;
                eventPopup.style.display = "none";
                renderCalendar();
            });
        } else {
            // Add new event
            db.collection("events").add({
                userId: currentUserId,
                title: title,
                date: selectedDate
            }).then(docRef => {
                events[selectedDate] = { title, docId: docRef.id };
                eventPopup.style.display = "none";
                renderCalendar();
            });
        }
    });

    // === Cancel Popup ===
    cancelEventBtn.addEventListener("click", function () {
        eventPopup.style.display = "none";
    });

    // === Navigation Buttons ===
    prevMonthBtn.addEventListener("click", function () {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", function () {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });

    // === Logout Button ===
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            auth.signOut().then(() => {
                alert("You have been logged out.");
                window.location.href = "login.html";
            });
        });
    }
});
