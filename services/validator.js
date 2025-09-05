/**
 * validates username is string, has no leading or trailing whitespace chars and is not an email
 * @param {*} username
 * @returns true - valid, false - invalid
 */
function validateUsername(username) {
  const res =
    typeof username === "string" &&
    username.length === username.trim().length &&
    username.length > 0 &&
    !/\s/.test(username) &&
    !validateEmail(username);
  if (res == false) console.log(`username validation falied for '${username}'`);
  return res;
}

/**
 * validate password is string and not empty
 * @param {*} password
 * @returns true - valid, false - invalid
 */
function validatePassword(password) {
  const res = typeof password === "string" && password.length > 0;
  if (res == false) console.log(`password validation falied for '${password}'`);
  return res;
}

/**
 * validate email is string and goes by email naming convention
 * @param {*} email
 * @returns
 */
function validateEmail(email) {
  //a random mail regex i found - they said it works 99.99% of the time
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const res = typeof email === "string" && regex.test(email);
  if (res == false) console.log(`email validation falied for '${email}'`);
  return res;
}

function validatePostParams(author, title, contentBlocks) {
  if (!author) {
    const err = new Error("Author is required");
    err.code = "INVALID_PARAM";
    throw err;
  }
  if (
    !title ||
    typeof title !== "string" ||
    title.trim().length !== title.length
  ) {
    const err = new Error("Title Invalid");
    err.code = "INVALID_PARAM";
    throw err;
  }

  contentBlocks = contentBlocks ? contentBlocks : [];

  contentBlocks.forEach((block, index) => {
    if (!block.type) {
      const err = new Error(`block type missing at index ${index}`);
      err.code = "INVALID_PARAM";
      throw err;
    }
    if (!block.value) {
      const err = new Error(`block value missing at index ${index}`);
      err.code = "INVALID_PARAM";
      throw err;
    }
  });
}

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validatePostParams,
};
