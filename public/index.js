// Add an event listener to the login form for the "submit" event
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent the default form submission (which reloads the page)

  // Get the userIdentifier and password values from the input fields
  const userIdentifier = document.getElementById("userIdentifier").value;
  const password = document.getElementById("password").value;
  const errorToast = new bootstrap.Toast(document.getElementById("errorToast"));
  const successToast = new bootstrap.Toast(
    document.getElementById("successToast")
  );

  try {
    // Send a POST request to the server at /auth/login
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIdentifier, password }), // Send userIdentifier & password as JSON
    });

    // Convert the server's response from JSON to a JavaScript object
    const data = await res.json();
    console.log(data); // For debugging in the browser console

    // If the server responded with success, show an alert and redirect to main page
    if (data.success) {
      successToast.show();
      document.querySelector(".form-container").classList.add("suck-away");
      setTimeout(() => {
        window.location.href = "/main_page.html";
      }, 2000);
    } else {
      // If login failed, show a failure alert
      errorToast.show();
    }
  } catch (err) {
    // If there was a network or fetch error, log it to the console
    console.error(err);
  }
});
