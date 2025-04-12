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

const app = initializeApp(firebaseConfig);

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
  if (!signUp) return;

  signUp.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("rEmail").value;
    const password = document.getElementById("rPassword").value;
    const firstName = document.getElementById("fName").value;
    const lastName = document.getElementById("lName").value;

    const auth = getAuth();
    const db = getFirestore();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        firstName: firstName,
        lastName: lastName
      });

      showMessage("Account created successfully!", "signUpMessage");
      setTimeout(() => {
        window.location.href = "signin.html"; // ✅ fixed typo
      }, 1000);

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        showMessage("Email already exists!", "signUpMessage");
      } else {
        console.error("Firebase Auth Error:", error);
        showMessage("Unable to create user", "signUpMessage");
      }
    }
  });
});

const signIn =document.getElementById('submitSignIn');
signIn.addEventListener('click', (event)=>{
  event.preventDefault();
    const email=document.getElementById("email").value;
  const password= document.getElementById("password").value;
  const auth= getAuth();

  signInWithEmailAndPassword(auth,email,password)
  .then((userCredential)=>{
    showMessage('login is successful','signInMessage');
    const user=userCredential.user;
    localStorage.setItem('loggedInUserId', user.uid);
    window.location.href='details.html';
  })
  .catch((error)=>{
    const errorCode=error.code;
    if(errorCode==='auth/invalid-credential'){
      showMessage("Incorrect Email or Password","signInMessage");
    }else{
      showMessage("Account does not Exhist",'signInMessage');
    }
  })
  
})

