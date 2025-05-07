// Firebase Config (replace with your project credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDWwikVGl6oHrCsAIWA9L3facXPcwAMk9c",
  authDomain: "fci-auth.firebaseapp.com",
  projectId: "fci-auth",
  storageBucket: "fci-auth.appspot.com",
  messagingSenderId: "1026364980448",
  appId: "1:1026364980448:web:f8f0d91949dcb79e976485"
};
firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();

let currentUserName = null;

// Get signed-in user's name (no redirect, as user is already signed in)
auth.onAuthStateChanged(user => {
  if (user) {
    currentUserName = user.displayName || user.email.split('@')[0];
    fetchQuestions();
  }
});

function postQuestion() {
  const question = document.getElementById("question").value.trim();
  if (!question || !currentUserName) return;

  db.collection("forumQuestions").add({
    username: currentUserName,
    questionText: question,
    date: new Date().toISOString(),
    replies: []
  }).then(() => {
    document.getElementById("question").value = "";
    fetchQuestions();
  });
}

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
    fetchQuestions();
  });
}

function fetchQuestions() {
  const forumPosts = document.getElementById("forum-posts");
  forumPosts.innerHTML = "";
  db.collection("forumQuestions").orderBy("date", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const q = doc.data();
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
        <div class="reply-input">
          <input type="text" placeholder="Your reply..." class="reply-text">
          <button onclick="postReply('${doc.id}', this.previousElementSibling)">Reply</button>
        </div>
      `;
      forumPosts.appendChild(div);
    });
  });
}
