
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission (which reloads the page)

    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorToastMessage = document.getElementById("errorToastMessage");
    const errorToast = new bootstrap.Toast(
      document.getElementById("errorToast")
    );
    const successToast = new bootstrap.Toast(
      document.getElementById("successToast")
    );

    console.log(email, username, password);
    // Get the userIdentifier and password values from the input fields
    try {
      // Send a POST request to the server at /register
      const res = await fetch("/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }), // Send userIdentifier & password as JSON
      });

   
      const data = await res.json();
      console.log(data); // For debugging in the browser console

      // If the server responded with success, show an alert and redirect to main page
      if (data.success) {
        successToast.show();
        document.querySelector(".form-container").classList.add("suck-away");
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } else {
        
        // If Register failed, show a failure alert
        errorToastMessage.innerText = data.message;
        errorToast.show();
      }
    } catch (err) {
      // If there was a network or fetch error, log it to the console
      console.error(err);
    }
  });
