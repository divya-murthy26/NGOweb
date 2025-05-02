let eventsList = [];

function addEvent() {
    const name = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;

    if (!name || !date) {
        alert("Please enter both event name and date.");
        return;
    }

    const eventId = `${name}-${date}`;
    if (eventsList.find(e => e.id === eventId)) {
        alert("Event already exists.");
        return;
    }

    const newEvent = {
        id: eventId,
        name,
        date,
        students: []
    };

    eventsList.push(newEvent);

    const option = document.createElement("option");
    option.value = eventId;
    option.textContent = `${name} - ${date}`;
    document.getElementById("eventSelect").appendChild(option);

    document.getElementById("eventName").value = "";
    document.getElementById("eventDate").value = "";

    renderThreads();
}

function addStudent() {
    const eventId = document.getElementById("eventSelect").value;
    const studentName = document.getElementById("studentName").value.trim();
    const batch = document.getElementById("batchSelect").value;

    if (!eventId || !studentName) {
        alert("Please select an event and enter student name.");
        return;
    }

    const event = eventsList.find(e => e.id === eventId);
    event.students.push({
        name: studentName,
        batch
    });

    document.getElementById("studentName").value = "";

    renderThreads();
}

function renderThreads(filteredList = null) {
    const container = document.getElementById("attendanceContainer");
    container.innerHTML = "";

    const list = filteredList || eventsList;

    list.forEach(event => {
        const thread = document.createElement("div");
        thread.className = "event-thread";

        const header = document.createElement("div");
        header.className = "event-header";
        header.textContent = `${event.name} - ${event.date}`;

        const studentList = document.createElement("div");
        studentList.className = "student-list";

        event.students.forEach(student => {
            const entry = document.createElement("div");
            entry.className = "student-entry";
            entry.textContent = `${student.name} (Batch: ${student.batch})`;
            studentList.appendChild(entry);
        });

        thread.appendChild(header);
        thread.appendChild(studentList);
        container.appendChild(thread);
    });
}

function filterAttendance() {
    const query = document.getElementById("searchBar").value.toLowerCase();
    const filtered = eventsList.filter(e =>
        e.name.toLowerCase().includes(query) || e.date.includes(query)
    );
    renderThreads(filtered);
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("FCI Attendance Report", 14, 10);

    let rows = [];
    eventsList.forEach(event => {
        event.students.forEach(student => {
            rows.push([event.name, event.date, student.name, student.batch]);
        });
    });

    doc.autoTable({
        head: [["Event Name", "Date", "Student Name", "Batch"]],
        body: rows
    });

    doc.save("Attendance_Report.pdf");
}

function downloadExcel() {
    let csv = [["Event Name", "Date", "Student Name", "Batch"]];
    eventsList.forEach(event => {
        event.students.forEach(student => {
            csv.push([event.name, event.date, student.name, student.batch]);
        });
    });

    let csvContent = csv.map(e => e.join(",")).join("\n");
    let blob = new Blob([csvContent], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Attendance_Report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
