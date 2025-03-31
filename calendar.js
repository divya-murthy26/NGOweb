document.addEventListener("DOMContentLoaded", function () {
    const calendarDays = document.getElementById("calendarDays");
    const currentMonth = document.getElementById("currentMonth");
    const prevMonthBtn = document.getElementById("prevMonth");
    const nextMonthBtn = document.getElementById("nextMonth");
    const eventList = document.getElementById("eventList");

    const events = {
        "2025-03-15": { name: "FCI Hackathon", description: "A coding competition for all students." },
        "2025-03-22": { name: "AI Workshop", description: "A deep learning and AI seminar by experts." },
        "2025-03-30": { name: "Cybersecurity Awareness", description: "A session on best practices in cybersecurity." }
    };

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
                dayDiv.addEventListener("click", function () {
                    alert(`${events[eventDate].name}: ${events[eventDate].description}`);
                });
            }

            calendarDays.appendChild(dayDiv);
        }

        updateEventList();
    }

    function updateEventList() {
        eventList.innerHTML = "";
        for (let eventDate in events) {
            const eventItem = document.createElement("li");
            eventItem.textContent = `${events[eventDate].name} - ${eventDate}`;
            eventList.appendChild(eventItem);
        }
    }

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
