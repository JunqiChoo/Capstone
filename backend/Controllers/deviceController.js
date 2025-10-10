const Device = require("../Models/deviceSchema");
const connectDB = require("../Database/MongoDb");

const getDevices = async(req,res)=>{
       connectDB();
    try {
        const Devices = await Device.find();
        res.json(Devices);
    } catch (err) {
        res.status(500).send("Server Error");
    }
}

module.exports = {getDevices}