// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDWwikVGl6oHrCsAIWA9L3facXPcwAMk9c",
  authDomain: "fci-auth.firebaseapp.com",
  projectId: "fci-auth",
  storageBucket: "fci-auth.appspot.com",
  messagingSenderId: "1026364980448",
  appId: "1:1026364980448:web:f8f0d91949dcb79e976485"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

// Sign in anonymously
firebase.auth().signInAnonymously().catch(console.error);

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        loadResources();
    }
});

function filterResources() {
    const searchInput = document.getElementById("searchBar").value.toLowerCase();
    const resources = document.querySelectorAll(".resource-item");

    resources.forEach(resource => {
        const title = resource.querySelector("h3").textContent.toLowerCase();
        const description = resource.querySelector("p").textContent.toLowerCase();
        resource.style.display = (title.includes(searchInput) || description.includes(searchInput)) ? "block" : "none";
    });
}

function filterCategory(category) {
    const resources = document.querySelectorAll(".resource-item");
    resources.forEach(resource => {
        const match = category === "all" || resource.dataset.category === category;
        resource.style.display = match ? "block" : "none";
    });
}

function openModal() {
    document.getElementById("resourceModal").style.display = "block";
}

function closeModal() {
    document.getElementById("resourceModal").style.display = "none";
    document.getElementById("resourceForm").reset();
    document.getElementById("uploadSection").innerHTML = "";
}

function toggleUploadMode() {
    const category = document.getElementById("category").value;
    const section = document.getElementById("uploadSection");
    if (category === "videos") {
        section.innerHTML = `<input type="url" id="videoLink" placeholder="Video URL" required>`;
    } else if (category === "files" || category === "guidelines") {
        section.innerHTML = `<input type="file" id="fileUpload" accept=".pdf,.doc,.docx,.zip,.ppt,.pptx" required>`;
    } else {
        section.innerHTML = "";
    }
}

document.getElementById("resourceForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;
    const userId = firebase.auth().currentUser.uid;

    if (!title || !description || !category) {
        alert("Please fill all fields.");
        return;
    }

    let url = "";
    try {
        if (category === "videos") {
            url = document.getElementById("videoLink").value.trim();
            if (!url) {
                alert("Please enter a valid video URL.");
                return;
            }
        } else {
            const fileInput = document.getElementById("fileUpload");
            const file = fileInput?.files?.[0];

            if (!file) {
                alert("Please upload a file.");
                return;
            }

            const ref = storage.ref(`resources/${Date.now()}_${file.name}`);
            await ref.put(file);
            url = await ref.getDownloadURL();
        }

        await db.collection("resources").add({
            title,
            description,
            category,
            url,
            userId,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        closeModal();
        loadResources();
    } catch (error) {
        console.error("Error saving resource:", error);
        alert("Something went wrong. Please try again.");
    }
});

async function loadResources() {
    const container = document.getElementById("resourceList");
    container.innerHTML = "";
    const userId = firebase.auth().currentUser.uid;

    const snapshot = await db.collection("resources").orderBy("createdAt", "desc").get();

    snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "resource-item";
        div.dataset.category = data.category;

        div.innerHTML = `
            <h3>${data.title}</h3>
            <p>${data.description}</p>
            <a href="${data.url}" target="_blank">${data.category === "videos" ? "Watch" : "Download"}</a>
        `;

        if (data.userId === userId) {
            const del = document.createElement("button");
            del.className = "delete-btn";
            del.innerText = "X";
            del.onclick = async () => {
                if (confirm("Delete this resource?")) {
                    await db.collection("resources").doc(doc.id).delete();
                    loadResources();
                }
            };
            div.appendChild(del);
        }

        container.appendChild(div);
    });
}
