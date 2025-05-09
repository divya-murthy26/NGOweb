// Firebase Config
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
const auth = firebase.auth();

let currentUserName = null;
let currentUserId = null;

// Authenticate user and set firstName if not set already
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserId = user.uid;

    // Check if the user already has firstName in Firestore
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists && doc.data().firstName) {
        // If firstName is already set, use it
        currentUserName = doc.data().firstName;
      } else {
        // If firstName is not set, use email prefix or set to "Anonymous"
        currentUserName = user.email ? user.email.split('@')[0] : "Anonymous";

        // Optionally, you can update the user's firstName in Firestore
        // if the firstName is missing. Uncomment the code below if you'd like
        db.collection("users").doc(user.uid).set({
          firstName: currentUserName, // Use the email prefix as a first name
        }, { merge: true });
      }
      fetchQuestions(); // Fetch questions once the username is set
    });
  }
});

// Post a new question to Firestore
function postQuestion() {
  const question = document.getElementById("question").value.trim();
  if (!question || !currentUserName || !currentUserId) return;

  db.collection("forumQuestions").add({
    username: currentUserName,
    userId: currentUserId,
    questionText: question,
    date: new Date().toISOString(),
    replies: []
  }).then(() => {
    document.getElementById("question").value = "";
    fetchQuestions(); // Refresh questions after posting
  });
}

// Post a reply to a question
function postReply(qid, replyTextEl) {
  const replyText = replyTextEl.value.trim();
  if (!replyText || !currentUserName) return;

  const reply = {
    username: currentUserName,
    replyText,
    date: new Date().toISOString()
  };

  db.collection("forumQuestions").doc(qid).update({
    replies: firebase.firestore.FieldValue.arrayUnion(reply)
  }).then(() => {
    replyTextEl.value = "";
    fetchQuestions(); // Refresh questions after posting reply
  });
}

// Delete a question
function deleteQuestion(qid) {
  if (!confirm("Are you sure you want to delete this question?")) return;

  db.collection("forumQuestions").doc(qid).delete()
    .then(() => {
      console.log("Question deleted");
      fetchQuestions(); // Refresh questions after deleting
    })
    .catch((error) => {
      console.error("Error deleting question:", error);
    });
}

// Fetch and display all questions
function fetchQuestions() {
  const forumPosts = document.getElementById("forum-posts");
  forumPosts.innerHTML = ""; // Clear previous questions

  db.collection("forumQuestions").orderBy("date", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const q = doc.data();
      const isOwnPost = q.userId === currentUserId;

      const div = document.createElement("div");
      div.className = "question-block";
      div.innerHTML = `
        <div><strong>${q.username}</strong></div>
        <div>${q.questionText}</div>
        <div class="question-meta">Posted on ${new Date(q.date).toLocaleString()}</div>
        <div class="replies">
          ${(q.replies || []).map(r => `
            <div class="reply">
              <div>${r.replyText}</div>
              <div class="reply-meta">- ${r.username}, ${new Date(r.date).toLocaleString()}</div>
            </div>
          `).join('')}
        </div>
        ${!isOwnPost ? `  
          <div class="reply-input">
            <input type="text" placeholder="Your reply..." class="reply-text">
            <button onclick="postReply('${doc.id}', this.previousElementSibling)">Reply</button>
          </div>` : ''}
        ${isOwnPost ? `
          <div class="delete-icon">
            <button onclick="deleteQuestion('${doc.id}')">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>` : ''}
      `;
      forumPosts.appendChild(div);
    });
  });
}
