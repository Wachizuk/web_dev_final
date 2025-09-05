const changeBtn = document.getElementById("change-avatar-btn");
const fileInput = document.getElementById("avatar-input");
const avatarImg = document.getElementById("profile-avatar");

changeBtn.addEventListener("click", () => {
  fileInput.click(); // simulate click on hidden input
});

fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    // send raw file to server
    const buf = await file.arrayBuffer();
    const res = await fetch("/uploads/avatar/new", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: buf,
    });

    const data = await res.json();
    if (res.ok) {
      // update the img src dynamically
      avatarImg.src = data.url + "?t=" + new Date().getTime(); // add timestamp to avoid caching
    } else {
      alert(data.error || "Failed to upload");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
});
