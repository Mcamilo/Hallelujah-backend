require('dotenv').config()
const fs = require("fs");
// console.log(process.env.GCP_CRED)
// console.log(process.env.GCP_KEY_FILE)
fs.writeFile(process.env.GCP_KEY_FILE, process.env.GCP_CRED, (err) => {});