
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



export { getGroupWindow, getCreateGroupWindow };
