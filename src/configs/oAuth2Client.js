const { OAuth2Client } = require("google-auth-library");

const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET
);

module.exports = oAuth2Client