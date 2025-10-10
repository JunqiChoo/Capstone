const mongoose = require('mongoose');


//Model for Entry
const EntrySchema = new mongoose.Schema({
  ingest_id: {
    type: String,
    required: true,
    unique: true, // e.g. PI-01:2025-09-21T02:30:16Z
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  meatWeight: {
    type: Number,
    default: 0,
  },
  vegWeight: {
    type: Number,
    default: 0,
  },
  carbWeight: {
    type: Number,
    default: 0,
  },
  totalWeight: {
    type: Number,
    required: true,
  },
   imagePath: {
    type: String, // store local path or cloud URL
    required: false,
  },
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
});


const Entry = mongoose.model("Entry",EntrySchema);
module.exports = Entry;