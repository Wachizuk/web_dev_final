const { get } = require('mongoose');
const User = require('../models/user'); // Import the User model from Mongoose
const Validator = require('./validator');

const getUserByEmail = async (email) =>{return await User.findOne({ email: email.toLowerCase() })};
const getUserByUsername = async (username) => {return await User.findOne({username})};
const getUserById = async (id) => {return await User.findById(id)}


//helper functions to get user properties by id
const getEmail = async (id) => {
    const user =  await getUserById(id);
    return user ? user.email : null
}
const getUsername = async (id) => {
    const user = await getUserById(id);
    return user ? user.username : null
}


/**
 * creates a user in db if params are valid and username is not taken
 * @param {String} username - non empty string, not email, has no leading or trailing whitespace chars
 * @param {String} email - follows email convention
 * @param {String} password - non empty string
 * @returns 1: success, 0: creation in db failed, -1: missing/invalid properties, -2: username already exists -3: email already exists
 */
async function register(username, email, password) {

    if(!Validator.validateUsername(username) || !Validator.validateEmail(email) || !Validator.validatePassword(password)) return -1;
    email = email.toLowerCase();

    if(await getUserByUsername(username)) return -2;
    if(await getUserByEmail(email)) return -3;


    try {
    await User.create({username: username, email: email, password: password})
    console.log(`the user ${username} was created successfully`)
    return 1;
    } catch {
        console.error(`failed creation of user ${username}`)
        return 0;
    }
}


/**
 * auths user in db
 * @param {*} userIdentifier - username or email
 * @param {*} password
 * @returns - user id on success, null on fail
 */
async function login(userIdentifier, password) {
    let user = null;
    if(Validator.validateUsername(userIdentifier)) {
        user = await User.findOne({username: userIdentifier, password: password});
    } else if (Validator.validateEmail(userIdentifier)) {
        user = await User.findOne({email: userIdentifier, password: password});
    }
        
    if(user) return user._id;

    return null;
}


module.exports = {getUserByEmail, getUserByUsername, getUserById,getEmail,getUsername, login, register}