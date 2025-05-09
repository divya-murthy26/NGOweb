// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDWwikVGl6oHrCsAIWA9L3facXPcwAMk9c",
  authDomain: "fci-auth.firebaseapp.com",
  projectId: "fci-auth",
  storageBucket: "fci-auth.appspot.com",
  messagingSenderId: "1026364980448",
  appId: "1:1026364980448:web:f8f0d91949dcb79e976485"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Badge assignment
function getBadge(score) {
  if (score >= 90) return "Gold Champion";
  else if (score >= 80) return "Silver Star";
  else if (score >= 70) return "Bronze Achiever";
  else if (score >= 60) return "Active Learner";
  else return "Contributor";
}

// Load leaderboard
window.onload = async function () {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";

  const snapshot = await db.collection("users").get(); // ✅ Fetch from 'users' collection
  let users = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      name: data.firstName || (data.email ? data.email.split("@")[0] : "Unknown"),
      score: data.score || 0
    });
  });

  users.sort((a, b) => b.score - a.score);

  users.forEach((user, index) => {
    const tr = document.createElement("tr");
    if (index === 0) tr.style.background = "#ffcc00";
    else if (index === 1) tr.style.background = "#c0c0c0";
    else if (index === 2) tr.style.background = "#cd7f32";

    tr.innerHTML = `
      <td>${index < 3 ? ["🥇", "🥈", "🥉"][index] : index + 1}</td>
      <td>${user.name}</td>
      <td>${user.score}</td>
      <td>${getBadge(user.score)}</td>
    `;
    tbody.appendChild(tr);
  });
};

// Download leaderboard as CSV
function downloadLeaderboard() {
  const table = document.getElementById("leaderboardTable");
  let csv = [];

  for (let i = 0; i < table.rows.length; i++) {
    let row = [],
      cols = table.rows[i].cells;
    for (let j = 0; j < cols.length; j++) {
      row.push(cols[j].innerText);
    }
    csv.push(row.join(","));
  }

  let csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
  let downloadLink = document.createElement("a");
  downloadLink.download = "Leaderboard_Report.csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}
