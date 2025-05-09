import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Function to display messages with fade-out effect
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) return;
  messageDiv.style.display = "block";
  messageDiv.innerText = message;
  messageDiv.style.opacity = 1;
  setTimeout(() => {
    messageDiv.style.opacity = 0;
  }, 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  const signUp = document.getElementById("submitSignUp");
  if (signUp) {
    signUp.addEventListener("click", async (event) => {
      event.preventDefault();

      const email = document.getElementById("rEmail").value;
      const password = document.getElementById("rPassword").value;
      const firstName = document.getElementById("fName").value;
      const lastName = document.getElementById("lName").value;

      if (!email || !password || !firstName || !lastName) {
        showMessage("All fields are required!", "signUpMessage");
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user profile
        await setDoc(doc(db, "users", user.uid), {
          email,
          firstName,
          lastName
        });

        // Initialize leaderboard
        await setDoc(doc(db, "leaderboard", user.uid), {
          score: 0,
          badge: "Beginner",
          firstName: firstName
        });

        showMessage("Account created successfully!", "signUpMessage");
        setTimeout(() => {
          window.location.href = "signin.html";
        }, 1000);

        // Clear the form
        document.getElementById("rEmail").value = '';
        document.getElementById("rPassword").value = '';
        document.getElementById("fName").value = '';
        document.getElementById("lName").value = '';

      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          showMessage("Email already exists!", "signUpMessage");
        } else {
          console.error("Firebase Auth Error:", error);
          showMessage("Unable to create user", "signUpMessage");
        }
      }
    });
  }

  const signIn = document.getElementById('submitSignIn');
  if (signIn) {
    signIn.addEventListener('click', (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (!email || !password) {
        showMessage("Both fields are required!", "signInMessage");
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          localStorage.setItem('loggedInUserId', user.uid);
          showMessage('Login is successful', 'signInMessage');
          setTimeout(() => {
            window.location.href = 'details.html';
          }, 1000);

          // Clear the form
          document.getElementById("email").value = '';
          document.getElementById("password").value = '';

        })
        .catch((error) => {
          const errorCode = error.code;
          if (errorCode === 'auth/invalid-credential') {
            showMessage("Incorrect Email or Password", "signInMessage");
          } else if (errorCode === 'auth/user-not-found') {
            showMessage("No account found with this email", 'signInMessage');
          } else {
            console.error("Firebase Auth Error:", error);
            showMessage("Something went wrong. Please try again.", 'signInMessage');
          }
        });
    });
  }
});
