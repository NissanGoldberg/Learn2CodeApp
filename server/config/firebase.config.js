var admin = require("firebase-admin");
const { serviceAccount } = require('./config')

//read from env variable
admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount)
    credential: admin.credential.cert(JSON.parse(serviceAccount))
});

module.exports = {
    admin,
}