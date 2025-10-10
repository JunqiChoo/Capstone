const mongoose = require('mongoose');

//Model for Device (Pi Camera)
const DeviceSchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  postalCode: {
    type: Number,
  },
  lastSeen: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["ok", "camera error"],
    default: "ok",
  },
});

const Device = mongoose.model("Device",DeviceSchema);
module.exports = Device;