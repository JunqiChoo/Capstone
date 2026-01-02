const express = require("express");
const router = express.Router();
require('dotenv').config();

//defined the logic from the controller

//Middelware
const auth = require("../Middleware/authMiddelware");

//Users Controller
const {CompareUser} = require("../Controllers/auth")
const {getProfile} = require("../Controllers/userController")
const {createUser} = require("../Controllers/userController")
const {getUser} = require("../Controllers/userController")

//Entries Controller
const {createEntry} = require("../Controllers/entryController");
const {getEntry} = require("../Controllers/entryController");
const {getAllEntries} = require("../Controllers/entryController");
const {deleteEntry} = require("../Controllers/entryController");
const {exportEntriesExcel} = require("../Controllers/entryController");

//Devices Controller
const {getDevices} = require("../Controllers/deviceController");
const {getDevice} = require("../Controllers/deviceController");




//Users end points
router.route("/register").post(createUser);
router.route("/login").post(CompareUser)
router.route("/getProfile").get(auth,getProfile)
router.route("/getUser/:id").get(getUser)

//Entries end points
router.route("/createEntry").post(createEntry);
router.route("/getEntry/:id").get(getEntry);
router.route("/getAllEntries").get(getAllEntries);
router.route("/deleteEntry/:id").delete(deleteEntry);

router.route("/exportCSV").get(exportEntriesExcel);



//Devices
router.route("/getDevices").get(getDevices)
router.route("/getDevice/:id").get(getDevice)

module.exports = router;
