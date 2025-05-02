document.addEventListener("DOMContentLoaded", function () {
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

    const events = {};

    let date = new Date();

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
                eventTitleInput.value = "";
                eventPopup.style.display = "block";
            });

            calendarDays.appendChild(dayDiv);
        }

        updateEventList();
    }

    function updateEventList() {
        eventList.innerHTML = "";
        for (let eventDate in events) {
            const li = document.createElement("li");
            li.textContent = `${events[eventDate]} - ${eventDate}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", function () {
                delete events[eventDate];
                renderCalendar();
            });

            li.appendChild(deleteBtn);
            eventList.appendChild(li);
        }
    }

    saveEventBtn.addEventListener("click", function () {
        const title = eventTitleInput.value.trim();
        const date = eventDateInput.value;

        if (title && date) {
            events[date] = title;
            eventPopup.style.display = "none";
            renderCalendar();
        } else {
            alert("Please enter both event title and date.");
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

    renderCalendar();
});
