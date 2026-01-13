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
            deviceId,
            stallId
        } = req.body

        const newEntry = new Entry({
            ingest_id: ingest_id,
            meatWeight: meatWeight || 0,
            vegWeight: vegWeight || 0,
            carbWeight: carbWeight || 0,
            totalWeight: totalWeight,
            imagePath: imagePath || null,
            deviceId: deviceId,
            stallId: stallId
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
    const { stallId, fromDate, toDate } = req.query;

    let query = {};
    
     if (stallId) {
      query.stallId = stallId;
    }

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
    const {
      from,
      to,
      weeklyTrend,
      totalWasteKg,
      todayWasteKg,
      nextWeekPrediction,
      carbonAnalytics,
      topContributor
    } = req.query;

    // ===== Date range =====
    const startDate = new Date(from);
    const endDate = new Date(to);
    endDate.setHours(23, 59, 59, 999);

    const entries = await Entry.find({
      timestamp: { $gte: startDate, $lte: endDate }
    }).lean();

    if (!entries.length) {
      return res.status(404).json({ message: "No data found" });
    }

    const workbook = new ExcelJS.Workbook();

    // =====================================================
    // GROUP ENTRIES BY STALL
    // =====================================================
    const stalls = {};
    entries.forEach(e => {
      const stall = e.stallId ?? "Unknown";
      if (!stalls[stall]) stalls[stall] = [];
      stalls[stall].push(e);
    });

    // =====================================================
    // CREATE ONE SHEET PER STALL
    // =====================================================
    Object.keys(stalls).forEach(stallId => {
      const sheet = workbook.addWorksheet(`Stall_${stallId}`);

      sheet.columns = [
        { header: "Ingest ID", key: "ingest_id" },
        { header: "Meat (g)", key: "meatWeight" },
        { header: "Veg (g)", key: "vegWeight" },
        { header: "Carbs (g)", key: "carbWeight" },
        { header: "Total (g)", key: "totalWeight" },
        { header: "Device ID", key: "deviceId" },
        { header: "Timestamp", key: "timestamp" }
      ];

      stalls[stallId].forEach(entry => {
        sheet.addRow(entry);
      });

      sheet.getRow(1).font = { bold: true };
    });

    // =====================================================
    // DASHBOARD INSIGHTS SHEET
    // =====================================================
    const insightSheet = workbook.addWorksheet("Dashboard_Insights");

    const overall = {
      meat: 0,
      veg: 0,
      carbs: 0,
      total: 0
    };

    const perStallTotals = {};

    entries.forEach(e => {
      overall.meat += e.meatWeight;
      overall.veg += e.vegWeight;
      overall.carbs += e.carbWeight;
      overall.total += e.totalWeight;

      const stall = e.stallId ?? "Unknown";
      if (!perStallTotals[stall]) {
        perStallTotals[stall] = { meat: 0, veg: 0, carbs: 0, total: 0 };
      }

      perStallTotals[stall].meat += e.meatWeight;
      perStallTotals[stall].veg += e.vegWeight;
      perStallTotals[stall].carbs += e.carbWeight;
      perStallTotals[stall].total += e.totalWeight;
    });

    // ===== Write dashboard rows =====
    insightSheet.addRows([
      ["Metric", "Value"],
      [],
      ["From Date", from],
      ["To Date", to],
      [],
      ["Total Entries", entries.length],
      [],
      ["Overall Meat Waste (g)", overall.meat],
      ["Overall Vegetable Waste (g)", overall.veg],
      ["Overall Carb Waste (g)", overall.carbs],
      ["Overall Total Waste (g)", overall.total],
      [],
      ["Weekly Trend", weeklyTrend || "N/A"],
      ["Total Waste (kg)", totalWasteKg || "N/A"],
      ["Today's Waste (kg)", todayWasteKg || "N/A"],
      ["Next Week Prediction (kg)", nextWeekPrediction || "N/A"],
      ["Carbon Analytics", carbonAnalytics || "N/A"],
      ["Top Waste Contributor", topContributor || "N/A"],
      []
    ]);

    // ===== Per-stall breakdown =====
    insightSheet.addRow(["Per-Stall Breakdown"]);
    insightSheet.addRow(["Stall", "Meat (g)", "Veg (g)", "Carbs (g)", "Total (g)"]);

    Object.keys(perStallTotals).forEach(stallId => {
      const s = perStallTotals[stallId];
      insightSheet.addRow([
        `Stall ${stallId}`,
        s.meat,
        s.veg,
        s.carbs,
        s.total
      ]);
    });

    insightSheet.getRow(1).font = { bold: true };
    insightSheet.getRow(insightSheet.lastRow.number - Object.keys(perStallTotals).length - 1).font = { bold: true };

    // =====================================================
    // SEND FILE
    // =====================================================
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const filename = `food_waste_report_${from}_to_${to}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Excel export failed" });
  }
};


module.exports = {createEntry,getEntry,deleteEntry,getAllEntries,exportEntriesExcel}