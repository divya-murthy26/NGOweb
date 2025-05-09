import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Badge assignment
function getBadge(score) {
  if (score >= 90) return "Gold Champion";
  else if (score >= 80) return "Silver Star";
  else if (score >= 70) return "Bronze Achiever";
  else if (score >= 60) return "Active Learner";
  else return "Contributor";
}

// Load leaderboard
async function loadLeaderboard() {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "users"));
    const seenNames = new Set();
    let users = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      let name = data.firstName?.trim();
      if (!name && data.email) {
        name = data.email.split("@")[0].trim();
      }

      if (!name || name.toLowerCase() === "anonymous" || seenNames.has(name.toLowerCase())) {
        return;
      }

      seenNames.add(name.toLowerCase());

      users.push({
        name: name,
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
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
}

// Download leaderboard as CSV
function downloadLeaderboard() {
  const table = document.getElementById("leaderboardTable");
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
  downloadLink.download = "Leaderboard_Report.csv";
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

// Update participant score
document.getElementById("updateScoreForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("participantName").value.trim();
  const additionalScore = parseInt(document.getElementById("additionalScore").value);

  if (!nameInput || isNaN(additionalScore)) {
    alert("Please enter a valid name and score.");
    return;
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("firstName", "==", nameInput));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("Participant not found.");
      return;
    }

    querySnapshot.forEach(async (docSnap) => {
      const currentScore = docSnap.data().score || 0;
      const newScore = currentScore + additionalScore;
      await updateDoc(doc(db, "users", docSnap.id), { score: newScore });
    });

    alert("Score updated successfully.");
    loadLeaderboard();
  } catch (error) {
    console.error("Error updating score:", error);
    alert("An error occurred while updating the score.");
  }
});

// Initial load
loadLeaderboard();
