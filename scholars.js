function sendMessage() {
    let messageBox = document.getElementById("chat-box");
    let messageInput = document.getElementById("message");
    let message = messageInput.value.trim();

    if (message !== "") {
        let newMessage = document.createElement("p");
        newMessage.textContent = "You: " + message;
        messageBox.appendChild(newMessage);
        messageBox.scrollTop = messageBox.scrollHeight;
        messageInput.value = "";
    }
}
