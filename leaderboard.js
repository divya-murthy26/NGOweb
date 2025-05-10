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

// Load and render leaderboard, and persist badges
async function loadLeaderboard() {
  const tbody = document.getElementById("leaderboardBody");
  tbody.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "users"));
    const seenNames = new Set();
    let users = [];

    // 1) Collect users, ensure score exists
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const id = docSnap.id;
      const userRef = doc(db, "users", id);

      // Determine display name
      let name = data.firstName?.trim();
      if (!name && data.email) {
        name = data.email.split("@")[0].trim();
      }
      if (!name || name.toLowerCase() === "anonymous" || seenNames.has(name.toLowerCase())) {
        continue;
      }
      seenNames.add(name.toLowerCase());

      // Initialize missing score
      let score = typeof data.score === "number" ? data.score : 0;
      if (typeof data.score !== "number") {
        await updateDoc(userRef, { score: 0 });
      }

      users.push({ id, name, score, ref: userRef });
    }

    // 2) Sort by score descending
    users.sort((a, b) => b.score - a.score);

    // 3) Assign badges by rank & score
    users.forEach((u, idx) => {
      let badge;
      if (idx === 0) badge = "Gold Champion";
      else if (idx === 1) badge = "Silver Star";
      else if (idx === 2) badge = "Bronze Achiever";
      else if (u.score > 0) badge = "Active Participant";
      else badge = "Contributor";
      u.badge = badge;
    });

    // 4) Persist badge changes in Firestore
    for (const u of users) {
      // only update if badge field is different or missing
      const currentBadge = (await u.ref.get()).data()?.badge;
      if (currentBadge !== u.badge) {
        await updateDoc(u.ref, { badge: u.badge });
      }
    }

    // 5) Render table rows
    users.forEach((u, idx) => {
      const tr = document.createElement("tr");
      if (idx === 0) tr.style.background = "#ffcc00";
      else if (idx === 1) tr.style.background = "#c0c0c0";
      else if (idx === 2) tr.style.background = "#cd7f32";

      tr.innerHTML = `
        <td>${idx < 3 ? ["🥇", "🥈", "🥉"][idx] : idx + 1}</td>
        <td>${u.name}</td>
        <td>${u.score}</td>
        <td>${u.badge}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error loading leaderboard:", error);
  }
}

// Download leaderboard as CSV
function downloadLeaderboard() {
  const table = document.getElementById("leaderboardTable");
  const csv = Array.from(table.rows)
    .map(row => Array.from(row.cells).map(cell => cell.innerText).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Leaderboard_Report.csv";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
}

// Update participant score (and then reload + badge–persist)
document.getElementById("updateScoreForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameInput = document.getElementById("participantName").value.trim();
  const addScore = parseInt(document.getElementById("additionalScore").value, 10);
  if (!nameInput || isNaN(addScore)) {
    return alert("Please enter a valid name and score.");
  }

  try {
    const usersRef = collection(db, "users");
    // 1) Try matching firstName
    let q = query(usersRef, where("firstName", "==", nameInput));
    let snap = await getDocs(q);

    // 2) Fallback to email prefix
    if (snap.empty) {
      snap = await getDocs(usersRef);
      snap = { docs: snap.docs.filter(d => {
        const em = d.data().email;
        return em && em.split("@")[0].trim().toLowerCase() === nameInput.toLowerCase();
      }) };
    }

    if (!snap.docs.length) {
      return alert("Participant not found.");
    }

    // 3) Update score for each matched doc
    for (const d of snap.docs) {
      const ref = doc(db, "users", d.id);
      const current = d.data().score || 0;
      await updateDoc(ref, { score: current + addScore });
    }

    alert("Score updated successfully.");
    await loadLeaderboard();
  } catch (err) {
    console.error(err);
    alert("Error updating score.");
  }
});

// Wire up buttons and initial load
document.getElementById("downloadBtn")?.addEventListener("click", downloadLeaderboard);
loadLeaderboard();
