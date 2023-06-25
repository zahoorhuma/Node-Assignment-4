const mongoose = require("mongoose");

const dbHost = process.env.DB_HOST;
console.log(dbHost);
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;

const uri = `mongodb://${dbHost}:${dbPort}/${dbName}`;

exports.connect = () => {
  // Connecting to the database
  mongoose
    .connect(uri)
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });
};
