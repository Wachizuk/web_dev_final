
const registerBtn = document.getElementById("registerBtn");

// Define the URLS
const urlLogin  = "/user/login";
const urlRegister = "/user/register";

registerBtn.addEventListener("click", () => {
  window.location.href = urlRegister;
});

// Add an event listener to the login form for the "submit" event
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault(); 
  // Get the userIdentifier and password values from the input fields
  const userIdentifier = document.getElementById("userIdentifier").value;
  const password = document.getElementById("password").value;

  const errorToast = new bootstrap.Toast(document.getElementById("errorToast"));
  const successToast = new bootstrap.Toast(document.getElementById("successToast"));

  try {
    // Send a POST request to the server at /login
    const res = await fetch(urlLogin, {
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
        window.location.href = "/";
      }, 2000);
    } else {
      // If login failed, show a failure alert
      errorToast.show();
    }
  } catch (err) {
    console.error(err);
  }
});

  const canvas = document.getElementById("titleCanvas");
  const ctx = canvas.getContext("2d");


  function resizeCanvas() {
  // match internal resolution to CSS size
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

  function draw() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#87CEEB"); // light blue
    sky.addColorStop(1, "#1e3c72"); // darker
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Sun moving slowly
    const time = Date.now() / 1000;
    const sunX = (Math.sin(time * 0.3) * 0.4 + 0.5) * w; // moving left-right
    const sunY = 40 + Math.sin(time * 0.2) * 10; // small up-down
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
    ctx.fillStyle = "yellow";
    ctx.fill();

    // Hills
    ctx.fillStyle = "#228B22"; // forest green
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.25, h - 40, w * 0.5, h);
    ctx.quadraticCurveTo(w * 0.75, h - 50, w, h);
    ctx.closePath();
    ctx.fill();

    // Birds (simple V shapes)
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const bx = 100 + i * 60 + Math.sin(time + i) * 20;
      const by = 40 + Math.cos(time + i) * 10;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 10, by - 5);
      ctx.lineTo(bx + 20, by);
      ctx.stroke();
    }

    // Text
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Village", w / 2, h / 2);

    requestAnimationFrame(draw);
  }
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
draw();


