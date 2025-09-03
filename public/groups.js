
// --------------------------------redirecting function--------------------------------- 

async function getGroupWindow(groupName) {
    try {
        const res = await fetch(`/groups/${groupName}`);

        if(!res.ok) {
            throw new Error(`response status code: ${res.status}`)
        }

        return res.text();
    } catch (err) {
        console.error(`failed getting group window for ${groupName}, error message: ${err.message}`)
    }
}

async function getCreateGroupWindow() {
    try {
        const res = await fetch(`/groups/new`);

        if(!res.ok) {
            throw new Error(`response status code: ${res.status}`)
        }

        return res.text();
    } catch (err) {
        console.error(`failed getting group creation window, error message: ${err.message}`)
    }
}
//--------------------------------------------------------------------------------------

// --------------------------------creat-group form  functions--------------------------

function initCreateGroupForm(onSuccess) {
    const form = document.getElementById("create-group-form");
    if (!form) return;

    const displayInput = document.getElementById("displayName");
    const descriptionInput = document.getElementById("description");
    const adminsInput = document.getElementById("admins");
    const managersInput = document.getElementById("managers");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            displayName: displayInput?.value || "",
            description: descriptionInput?.value || "",
            admins:      adminsInput?.value || "",
            managers:    managersInput?.value || "",
        };

        if (!payload.displayName.trim()) {
            alert("Display name is required");
            return;
        }

        try {
            const res  = await fetch("/groups", {
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

            // success 
            if (typeof onSuccess === "function") await onSuccess(data.groupName, data.displayName);
            else window.location.hash = `/groups/${data.groupName}`;
        } catch (err) {
            console.error(err);
            alert("Server error creating group");
        }
    });
}
//---------------------------------------------------------------------------------------

export { getGroupWindow, getCreateGroupWindow, initCreateGroupForm };
