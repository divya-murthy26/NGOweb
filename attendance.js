let eventsList = [];

const db = firebase.firestore();
const auth = firebase.auth();

// Load all events once user is authenticated
auth.onAuthStateChanged(user => {
    if (user) {
        loadEvents();
    } else {
        alert("Please log in to use the attendance system.");
        window.location.href = "index.html";
    }
});

function loadEvents() {
    db.collection("attendance").get()
        .then(snapshot => {
            eventsList = [];
            const select = document.getElementById("eventSelect");
            select.innerHTML = "";

            snapshot.forEach(doc => {
                const data = doc.data();
                const event = {
                    id: doc.id,
                    name: data.eventname || "Unnamed",
                    date: data.date || "No Date",
                    students: data.students || [],
                    userId: data.userId
                };
                eventsList.push(event);

                const option = document.createElement("option");
                option.value = doc.id;
                option.textContent = `${event.name} - ${event.date}`;
                select.appendChild(option);
            });

            renderThreads();
        })
        .catch(error => {
            console.error("Error loading events:", error);
        });
}

function addEvent() {
    const name = document.getElementById("eventName").value.trim();
    const date = document.getElementById("eventDate").value;

    if (!name || !date) {
        alert("Please enter both event name and date.");
        return;
    }

    const existing = eventsList.find(e => e.name === name && e.date === date);
    if (existing) {
        alert("Event already exists.");
        return;
    }

    const newEvent = {
        eventname: name,
        date,
        students: [],
        userId: auth.currentUser.uid
    };

    db.collection("attendance").add(newEvent)
        .then(docRef => {
            loadEvents(); // reload everything including dropdown
            document.getElementById("eventName").value = "";
            document.getElementById("eventDate").value = "";
        })
        .catch(error => {
            console.error("Error adding event:", error);
        });
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
    const newStudent = { name: studentName, batch };
    event.students.push(newStudent);

    db.collection("attendance").doc(eventId).update({
        students: event.students
    })
        .then(() => {
            document.getElementById("studentName").value = "";
            renderThreads();
        })
        .catch(error => {
            console.error("Error updating students:", error);
        });
}

function deleteEvent(eventId) {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const event = eventsList.find(e => e.id === eventId);

    // Check permission
    if (!event || event.userId !== auth.currentUser.uid) {
        alert("You do not have permission to delete this event.");
        return;
    }

    db.collection("attendance").doc(eventId).delete()
        .then(() => {
            console.log("Event deleted from Firestore:", eventId);
            loadEvents(); // refresh everything after delete
        })
        .catch((error) => {
            console.error("Error deleting event:", error);
            alert("Error deleting event: " + error.message);
        });
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
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";

        const title = document.createElement("span");
        title.textContent = `${event.name} - ${event.date}`;

        const deleteBtn = document.createElement("span");
        deleteBtn.innerHTML = "🗑️";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.title = "Delete Event";
        deleteBtn.onclick = () => deleteEvent(event.id);

        header.appendChild(title);
        header.appendChild(deleteBtn);

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
        (e.name || "").toLowerCase().includes(query) || (e.date || "").includes(query)
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
