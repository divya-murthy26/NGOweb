function filterAttendance() {
    let searchInput = document.getElementById("searchBar").value.toLowerCase();
    let tableRows = document.querySelectorAll("#attendanceTable tbody tr");

    tableRows.forEach(row => {
        let eventName = row.cells[0].textContent.toLowerCase();
        let eventDate = row.cells[1].textContent.toLowerCase();

        if (eventName.includes(searchInput) || eventDate.includes(searchInput)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Function to Download Attendance as PDF
function downloadPDF() {
    let doc = new jsPDF();
    doc.text("FCI Attendance Report", 14, 10);
    let table = document.getElementById("attendanceTable");
    let rows = [];

    for (let i = 0; i < table.rows.length; i++) {
        let row = [];
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            row.push(table.rows[i].cells[j].innerText);
        }
        rows.push(row);
    }

    doc.autoTable({
        head: [rows[0]],
        body: rows.slice(1),
    });

    doc.save("Attendance_Report.pdf");
}

// Function to Download Attendance as Excel
function downloadExcel() {
    let table = document.getElementById("attendanceTable");
    let csv = [];
    for (let i = 0; i < table.rows.length; i++) {
        let row = [], cols = table.rows[i].cells;
        for (let j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        csv.push(row.join(","));
    }
    let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    let downloadLink = document.createElement("a");
    downloadLink.download = "Attendance_Report.csv";
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}
