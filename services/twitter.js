const { TwitterApi } = require("twitter-api-v2");

let twitterKeysValid = false;
if(process.env.API_KEY && process.env.API_SECRET && process.env.ACCESS_TOKEN && process.env.ACCESS_SECRET) {
  console.log("twitter keys exist")
  twitterKeysValid = true;
} else {
  console.log("twitter keys missing")
}

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

const bearer = new TwitterApi(process.env.BEARER_TOKEN);

const twitterClient = client.readWrite;
const twitterBearer = bearer.readOnly;

const tweet = async (input) => {
  
  try {
    if(twitterKeysValid) {
    await twitterClient.v2.tweet(input);
    } else {
      console.log("skip twitter post because of missing keys")
    }
  } catch (e) {
     console.error(e);
  }


}


module.exports = {tweet};

