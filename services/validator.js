

/**
 * validates username is string, has no leading or trailing whitespace chars and is not an email
 * @param {*} username
 * @returns true - valid, false - invalid
 */
function validateUsername(username) {
    const res = typeof(username) === 'string' && username.length === username.trim().length && username.length > 0&&
    !/\s/.test(username) && !validateEmail(username);
    if(res == false) console.log(`username validation falied for '${username}'`)
    return res;
}

/**
 * validate password is string and not empty
 * @param {*} password 
 * @returns true - valid, false - invalid
 */
function validatePassword(password) {
    const res = typeof(password) === 'string' && password.length > 0;
    if(res == false) console.log(`password validation falied for '${password}'`);
    return res;
}


/**
 * validate email is string and goes by email naming convention
 * @param {*} email 
 * @returns 
 */
function validateEmail(email) {
    //a random mail regex i found - they said it works 99.99% of the time
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const res =  typeof(email) === 'string' && regex.test(email);
    if(res == false) console.log(`email validation falied for '${email}'`);
    return res;
}

function validatePostParams(author, title, contentBlocks) {
    if (!author) throw new Error("Author is required");
    if (!title || typeof title !== "string" || title.trim().length !== title.length) throw new Error("invalid title");
    
    for(const block of contentBlocks) {
        if(!block.type) throw new Error('block type missing');
        if(!block.value) throw new Error('block value missing');
    }
}

module.exports = {validateEmail, validatePassword, validateUsername, validatePostParams}