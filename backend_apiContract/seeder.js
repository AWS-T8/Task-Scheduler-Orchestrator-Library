/* File-->
- To insert the test data into the Database
- To delete all the data into the Database
*/

const dotenv = require("dotenv");
const testData = require("./testData.js");
const Task = require("./models/taskDB.js");
const User = require("./models/userDB");
const connectDB = require("./configure/db.js");
dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Task.deleteMany();
    await Task.insertMany(testData);
    console.log("Data Imported");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Task.deleteMany();
    await User.deleteMany();
    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
