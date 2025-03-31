let currentUser = "";

function login() {
    let usernameInput = document.getElementById("username").value.trim();
    if (usernameInput === "") {
        alert("Please enter your name");
        return;
    }
    currentUser = usernameInput;
    document.querySelector(".login").style.display = "none";
    alert("Welcome, " + currentUser + "!");
}

function postQuestion() {
    if (currentUser === "") {
        alert("You must log in first!");
        return;
    }

    let questionText = document.getElementById("question").value.trim();
    let category = document.getElementById("category").value;

    if (questionText === "") {
        alert("Please enter a question.");
        return;
    }

    let forumPosts = document.getElementById("forum-posts");

    let questionDiv = document.createElement("div");
    questionDiv.classList.add("question");

    let userSpan = document.createElement("span");
    userSpan.classList.add("username");
    userSpan.textContent = currentUser;

    let categorySpan = document.createElement("span");
    categorySpan.classList.add("category");
    categorySpan.textContent = " (" + category + ")";

    let questionP = document.createElement("p");
    questionP.textContent = questionText;

    let upvoteButton = document.createElement("button");
    upvoteButton.classList.add("upvote");
    upvoteButton.textContent = "Upvote (0)";
    upvoteButton.dataset.votes = 0;

    upvoteButton.addEventListener("click", function () {
        let votes = parseInt(upvoteButton.dataset.votes) + 1;
        upvoteButton.dataset.votes = votes;
        upvoteButton.textContent = "Upvote (" + votes + ")";
    });

    questionDiv.appendChild(userSpan);
    questionDiv.appendChild(categorySpan);
    questionDiv.appendChild(questionP);
    questionDiv.appendChild(upvoteButton);

    forumPosts.prepend(questionDiv);

    document.getElementById("question").value = "";
}
