document.getElementById("feedbackForm").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent default form submission
  
    const parms = {
      date: document.getElementById("date").value,
      mode: document.getElementById("mode").value,
      mentiName: document.getElementById("mentiName").value,
      mentorName: document.getElementById("mentorName").value,
      duration: document.getElementById("duration").value,
      points: document.getElementById("points").value,
      feedbackText: document.getElementById("feedbackText").value,
    };
  
    emailjs.send("service_03lkqxl", "template_r5la49l", parms)
      .then(function(response) {
        console.log("SUCCESS!", response.status, response.text);
        alert("Feedback submitted successfully!");
        document.getElementById("feedbackForm").reset(); // Optional: reset the form
      }, function(error) {
        console.error("FAILED...", error);
        alert("Failed to send feedback. Please try again.");
      });
  });
  