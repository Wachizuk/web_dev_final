import { renderContentWindow } from "../utils/renderer.js";
import { routes } from "../utils/routes.js";

console.log("create-group")

const form = document.getElementById("create-group-form");
if (!form) console.error("form element is missing on create group window");

const displayInput = document.getElementById("displayName");
const descriptionInput = document.getElementById("description");
const adminsInput = document.getElementById("admins");
const managersInput = document.getElementById("managers");

// cover image upload handling
const coverPickBtn   = document.getElementById("coverPickBtn");
const coverInput     = document.getElementById("groupCover");
const coverImageHint = document.getElementById("coverImageHint");

// hook button to hidden input
coverPickBtn?.addEventListener("click", () => coverInput?.click());
coverInput?.addEventListener("change", () => {
  const f = coverInput.files?.[0];
  coverImageHint.textContent = f ? f.name : "Prefer to use 3:1 ratio image, if not image will be cropped!";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    displayName: displayInput?.value || "",
    description: descriptionInput?.value || "",
    admins: adminsInput?.value || "",
    managers: managersInput?.value || "",
  };

  if (!payload.displayName.trim()) {
    alert("Display name is required");
    return;
  }

  try {
    const res = await fetch("/groups/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || !data?.ok) {
      const parts = [];
      if (data?.message) parts.push(data.message);
      const inv = data?.invalid || {};
      if (Array.isArray(inv.admins) && inv.admins.length) {
        parts.push(`Invalid admin usernames: ${inv.admins.join(", ")}`);
      }
      if (Array.isArray(inv.managers) && inv.managers.length) {
        parts.push(`Invalid manager usernames: ${inv.managers.join(", ")}`);
      }
      alert(parts.join("\n") || "Could not create group");
      return;
    }

    // if we have a cover image, upload it
    const file = coverInput?.files?.[0];
    if (file) {
      try {
        await fetch(`/uploads/groups/${data.groupName}/cover`, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch (e) {
        console.error("Cover upload failed:", e);
        alert("Cover upload failed");
      }
    }

    // render group page after its been created
    await renderContentWindow(routes.groups.groupName(data.groupName));
  } catch (err) {
    console.error(err);
    alert("Server error creating group");
  }
});
