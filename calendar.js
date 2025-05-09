document.addEventListener("DOMContentLoaded", function () {
    const db = firebase.firestore();
    const auth = firebase.auth();

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

    auth.onAuthStateChanged(user => {
        if (user) {
            currentUserId = user.uid;
            loadEvents();
        } else {
            alert("Please log in to use the calendar.");
            window.location.href = "login.html";
        }
    });

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

            if (events[eventDate] && events[eventDate].length > 0) {
                dayDiv.classList.add("event-day");
            }

            dayDiv.addEventListener("click", function () {
                eventDateInput.value = eventDate;
                const userEvent = (events[eventDate] || []).find(e => e.userId === currentUserId);
                eventTitleInput.value = userEvent ? userEvent.title : "";
                eventPopup.style.display = "block";
            });

            calendarDays.appendChild(dayDiv);
        }

        updateEventList();
    }

    function loadEvents() {
        db.collection("events").get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!events[data.date]) {
                    events[data.date] = [];
                }
                events[data.date].push({
                    title: data.title,
                    userId: data.userId,
                    docId: doc.id
                });
            });
            renderCalendar();
        });
    }

    function updateEventList() {
        eventList.innerHTML = "";
        const sortedDates = Object.keys(events).sort();

        for (let eventDate of sortedDates) {
            events[eventDate].forEach(event => {
                const li = document.createElement("li");
                li.textContent = `${event.title} - ${eventDate}`;

                // ✅ Add delete button for all events
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.style.marginLeft = "10px";
                deleteBtn.addEventListener("click", function () {
                    db.collection("events").doc(event.docId).delete().then(() => {
                        events[eventDate] = events[eventDate].filter(e => e.docId !== event.docId);
                        if (events[eventDate].length === 0) delete events[eventDate];
                        renderCalendar();
                    });
                });
                li.appendChild(deleteBtn);

                eventList.appendChild(li);
            });
        }
    }

    saveEventBtn.addEventListener("click", function () {
        const title = eventTitleInput.value.trim();
        const selectedDate = eventDateInput.value;

        if (!title || !selectedDate || !currentUserId) {
            alert("Please enter both event title and date.");
            return;
        }

        const existingUserEvent = (events[selectedDate] || []).find(e => e.userId === currentUserId);

        if (existingUserEvent) {
            db.collection("events").doc(existingUserEvent.docId).update({
                title: title
            }).then(() => {
                existingUserEvent.title = title;
                eventPopup.style.display = "none";
                renderCalendar();
            });
        } else {
            db.collection("events").add({
                userId: currentUserId,
                title: title,
                date: selectedDate
            }).then(docRef => {
                if (!events[selectedDate]) events[selectedDate] = [];
                events[selectedDate].push({ title, userId: currentUserId, docId: docRef.id });
                eventPopup.style.display = "none";
                renderCalendar();
            });
        }
    });

    cancelEventBtn.addEventListener("click", function () {
        eventPopup.style.display = "none";
    });

    prevMonthBtn.addEventListener("click", function () {
        date.setMonth(date.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener("click", function () {
        date.setMonth(date.getMonth() + 1);
        renderCalendar();
    });

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            auth.signOut().then(() => {
                alert("You have been logged out.");
                window.location.href = "login.html";
            });
        });
    }
});
