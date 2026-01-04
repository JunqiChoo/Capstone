const Entry = require("../Models/entrySchema");
const connectDB = require("../Database/MongoDb");
const ExcelJS = require("exceljs");

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
const exportEntriesExcel = async (req, res) => {
  try {
    const { from, to } = req.query;

    // 🔑 FIX 1: Proper date range
    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999); // ✅ include full day

    const entries = await Entry.find({
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    }).lean();

    if (!entries.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const workbook = new ExcelJS.Workbook();

    // ==========================
    // Sheet 1: Raw Entries
    // ==========================
    const entrySheet = workbook.addWorksheet("Raw_Entries");

    entrySheet.columns = [
      { header: "Ingest ID", key: "ingest_id" },
      { header: "Meat (g)", key: "meatWeight" },
      { header: "Veg (g)", key: "vegWeight" },
      { header: "Carbs (g)", key: "carbWeight" },
      { header: "Total (g)", key: "totalWeight" },
      { header: "Device ID", key: "deviceId" },
      { header: "Timestamp", key: "timestamp" },
    ];

    entries.forEach(entry => {
      entrySheet.addRow(entry);
    });

    // ==========================
    // Sheet 2: Dashboard Insights
    // ==========================
    const insightSheet = workbook.addWorksheet("Dashboard_Insights");

    const totalWaste = entries.reduce((s, e) => s + e.totalWeight, 0);
    const totalMeat = entries.reduce((s, e) => s + e.meatWeight, 0);
    const totalVeg = entries.reduce((s, e) => s + e.vegWeight, 0);
    const totalCarbs = entries.reduce((s, e) => s + e.carbWeight, 0);

    insightSheet.addRows([
      ["Metric", "Value"],
      ["Total Waste (g)", totalWaste],
      ["Total Meat Waste (g)", totalMeat],
      ["Total Vegetable Waste (g)", totalVeg],
      ["Total Carb Waste (g)", totalCarbs],
      ["Entries Count", entries.length],
      ["From Date", from],
      ["To Date", to],
    ]);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    const safeFrom = from.replace(/[:]/g, "-");
    const safeTo = to.replace(/[:]/g, "-");

    const filename = `food_waste_report_${safeFrom}_to_${safeTo}.xlsx`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel export failed" });
  }
};

module.exports = {createEntry,getEntry,deleteEntry,getAllEntries,exportEntriesExcel}