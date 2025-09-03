async function getSettingWindow() {
  try {
    const res = await fetch(`/user/settings`); //GET METHOD by default

    if (!res.ok) {
      throw new Error(`response status code: ${res.status}`);
    }

    return res.text();
  } catch (err) {
    console.error(
      console.error(
        `failed getting group creation window, error message: ${err.message}`
      )
    );
  }
}

//URLS
const urlChangeUsername = "/user/change-username";
const urlChangeEmail = "/user/change-email";
const urlChangePassword = "/user/change-password";
const urlDeleteAccont = "/user/delete-account";

// FUNCTIONS
function initSettingsHandlers() {
  const usernameForm = document.getElementById("updateUsernameForm");
  const emailForm = document.getElementById("updateEmailForm");
  const passwordForm = document.getElementById("updatePasswordForm");
  const deleteForm = document.getElementById("deleteAccountForm");

  // Exit early if forms are not found in DOM
  if (!usernameForm) return;
  if (!emailForm) return;
  if (!passwordForm) return;

  // ---------- Change Username ----------
  usernameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      // Get username input
      const usernameInput = document.getElementById("username").value;

      // Send POST request to server
      const res = await fetch(urlChangeUsername, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput }),
      });

      // Parse server response
      const data = await res.json();

      // Show feedback message
      const msgBox = document.getElementById("usernameMessage");
      msgBox.textContent = data.message;
      msgBox.className = data.success
        ? "mt-3 text-success"
        : "mt-3 text-danger";

      // Redirect if successful
      if (data.success) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      window.location.href = "/";
    }
  });

  // ---------- Change Email ----------
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      // Get email input
      const emailInput = document.getElementById("email").value;

      // Send POST request to server
      const res = await fetch(urlChangeEmail, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput }),
      });

      // Parse server response
      const data = await res.json();

      // Show feedback message
      const msgBox = document.getElementById("emailMessage");
      msgBox.textContent = data.message;
      msgBox.className = data.success
        ? "mt-3 text-success"
        : "mt-3 text-danger";

      // Redirect if successful
      if (data.success) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      alert(message);
    }
  });

  // ---------- Change Password ----------
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msgBox = document.getElementById("passwordMessage");

    try {
      const newPasswordInput = document.getElementById("password").value;
      const confirmPasswordInput =
        document.getElementById("confirmPassword").value;

      // Show error and stop if passwords don't match
      if (newPasswordInput !== confirmPasswordInput) {
        msgBox.textContent = "Passwords do not match";
        msgBox.className = "mt-3 text-danger";
        return;
      }

      // Send request only when they match
      const res = await fetch(urlChangePassword || "/user/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPasswordInput }),
      });

      const data = await res.json();

      msgBox.textContent = data.message;
      msgBox.className = data.success
        ? "mt-3 text-success"
        : "mt-3 text-danger";

      if (data.success) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error(error);
      msgBox.textContent = "Server error";
      msgBox.className = "mt-3 text-danger";
    }
  });

// ---------- Delete Account ----------
if (deleteForm) {
  const deletePasswordInput = document.getElementById("deletePassword");
  const deleteBtn = document.getElementById("deleteBtn");
  const deleteMsg = document.getElementById("deleteMessage");

  // Enable delete button only when password is non-empty
  const toggleDeleteBtn = () => {
    deleteBtn.disabled = deletePasswordInput.value.trim().length === 0;
  };
  toggleDeleteBtn();
  deletePasswordInput.addEventListener("input", toggleDeleteBtn);

  deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      // Send request to server with the entered password
      const res = await fetch(urlDeleteAccont, {
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePasswordInput.value })
      });

      const data = await res.json();

      // Show feedback message
      deleteMsg.textContent = data.message;
      deleteMsg.className = data.success ? "mt-3 text-success" : "mt-3 text-danger";

      // On success, redirect (e.g., to logout)
      if (data.success) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
      deleteMsg.textContent = "Server error";
      deleteMsg.className = "mt-3 text-danger";
    }
  });
}

}

export { getSettingWindow, initSettingsHandlers };
