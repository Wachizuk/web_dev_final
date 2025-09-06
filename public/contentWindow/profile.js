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

const replaceAdress = () => {
  const form = document.getElementById("address-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newAddress = form.querySelector("input").value;
    if (!newAddress) return;
    console.log(newAddress);
    try {
      const res = await fetch("/user/change-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: newAddress }),
      });

      const data = await res.json();
      if (data.success) {
        window.location.reload();

      } else {
        alert(data.message || "Failed to update address");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating address");
    }
  });
}
replaceAdress();
