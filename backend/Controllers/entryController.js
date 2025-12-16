const Entry = require("../Models/entrySchema");
const connectDB = require("../Database/MongoDb");

//Controller portiion is basically to segregrate the logic aspect.
//All the logic for each function will be written here.


//Create
const createEntry = async (req, res) => {
    await connectDB();
    try {
        const {
            ingest_id,
            meatWeight,
            vegWeight,
            carbWeight,
            totalWeight,
            imagePath,
            deviceId
        } = req.body

        const newEntry = new Entry({
            ingest_id: ingest_id,
            meatWeight: meatWeight || 0,
            vegWeight: vegWeight || 0,
            carbWeight: carbWeight || 0,
            totalWeight: totalWeight,
            imagePath: imagePath || null,
            deviceId: deviceId,
        });

        const savedEntry = await newEntry.save();
        console.log("New Entry Saved:", savedEntry);
        res.status(201).json(savedEntry);

    } catch {
        console.error(err);
        res.status(500).json({ message: "Error creating entry", error: err.message });
    }
    //Example seed data for POSTMAN testing
        /*
        {
        "ingest_id": "PI-01:2025-10-04T20:30:16Z",
        "meatWeight": 100,
        "vegWeight": 50,
        "carbWeight": 120,
        "totalWeight": 280,
        "imagePath": "/uploads/images/test_01.jpg",
        "deviceId": "68e12f962038417beaadc836"
        }
        */
};
//Read
const getEntry = async(req,res)=>{
    const id = req.params.id
    await connectDB();
    try{
        const singleEntry = await Entry.findById(id);
        console.log(singleEntry)
        res.json(singleEntry)
    }catch(err){
        console.log(err)
    }
}

//viewAllEntries
const getAllEntries = async (req, res) => {
  await connectDB();

  try {
    const { fromDate, toDate } = req.query;

    let query = {};

    // If date range is provided, apply filter
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999); // include entire "to" day

      query.timestamp = {
        $gte: from,
        $lte: to
      };
    }

    const allEntries = await Entry
      .find(query)
      .sort({ timestamp: -1 }); // newest first

    res.json(allEntries);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};


//Delete
const deleteEntry =async()=>{
       const id = req.params.id
    await connectDB();
    try{
        const singleEntry = await Entry.findOneAndDelete(id);
        console.log(singleEntry)
        res.json(singleEntry)
    }catch(err){
        console.log(err)
    }
}

module.exports = {createEntry,getEntry,deleteEntry,getAllEntries}