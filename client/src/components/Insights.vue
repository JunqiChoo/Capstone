<template>

  <div class="container mt-4">
    <div class="row">
      <div class="col">
        <div class="card bg-light mb-3 p-3">
          <form class="row g-3 align-items-end">

            <!-- From date -->
            <div class="col-md-5">
              <label for="fromDate" class="form-label fw-semibold">From</label>
              <input type="date" class="form-control" id="fromDate" v-model="fromDate" />
            </div>

            <!-- To date -->
            <div class="col-md-5">
              <label for="toDate" class="form-label fw-semibold">To</label>
              <input type="date" class="form-control" id="toDate" v-model="toDate" />
            </div>

            <!-- Apply button -->
            <div class="col-md-2 d-grid">
              <button type="button" class="btn btn-primary" @click="ExportCSV">
                <i class="bi bi-download"></i>
                Export to CSV
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Weekly Trend</h5>
            <p class="card-text fw-bold display-6" :class="weeklyTrend.cls">
              <i class="bi" :class="weeklyTrend.icon"></i>
              {{ weeklyTrend.text }}
            </p>

          </div>
        </div>
      </div>

      <div class="col">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Total Waste for Selected Dates</h5>
            <p class="card-text fw-bold text-dark display-6"> {{ totalWasteKgSelected }} Kg</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card bg-light mb-3">

          <div class="card-body text-center">
            <h5 class="card-title">Today's Waste</h5>
            <p class="card-text fw-bold text-dark display-6">{{ todayWasteKg }} Kg</p>
          </div>
        </div>
      </div>



    </div>
  </div>
  <div class="container ">
    <div class="row">
      <div class="col-4">
        <div class="card bg-light mb-3 large-card">
          <div class="card-body text-center">
            <h3>Waste Chart</h3>

            <!-- Wrapper controls size -->
            <div class="chart-wrapper">
              <canvas ref="weeklyBarChart"></canvas>
            </div>

          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card bg-light mb-3 large-card">
          <div class="card-body text-center">
            <h3>Carbon Emission Chart</h3>
            <div class="chart-wrapper">
              <canvas ref="carbonBarChart"></canvas>
            </div>

          </div>
        </div>
      </div>


      <div class="col-4">
        <div class="card bg-light mb-3 large-card">
          <div class="card-body text-center">
            <h3>Next Week's Estimate</h3>

            <p v-if="nextWeekPrediction !== null" class="fw-bold display-3 text-primary">
              {{ nextWeekPrediction }} kg
            </p>

            <p v-else class="text-muted">
              Insufficient data
            </p>

            <small class="text-muted">
              ML-based linear regression forecast
            </small>
          </div>
        </div>
      </div>

    </div>

    <!--Here is for the ML prediction estimate-->
    <div class="row">
      <div class="col">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h3>Analytics</h3>

            <p class="fw-bold fs-5 mt-3" :class="carbonAnalytics.cls">
              <i class="bi" :class="carbonAnalytics.icon"></i>
              {{ carbonAnalytics.text }}
            </p>
          </div>
        </div>
      </div>

      <div class="col">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">



            <div class="alert alert-warning d-flex align-items-center justify-content-center mb-0 attention-pulse"
              role="alert" style="font-size: 1.05rem;">
              <i class="bi bi-exclamation-circle-fill me-2"></i>
              <span v-html="actionableInsight"></span>

            </div>

          </div>
        </div>

      </div>

    </div>

    <div class="mt-1">
      <button type="button" class="btn btn-secondary" @click="btnClickBack">Back</button>
    </div>
  </div>
  <!--Table of device status-->


</template>
<script setup>
import { ref, onMounted, onBeforeMount,computed , watch} from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import { useToast } from 'vue-toastification'
const toast = useToast()

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  BarController,
  BarElement
} from 'chart.js'


// for line chart
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)
//for bar chart
Chart.register(
  // Bar chart
  BarController,
  BarElement,

  // Line chart
  LineController,
  LineElement,
  PointElement,

  // Pie chart
  PieController,
  ArcElement,

  // Shared
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
)

const router = useRouter()
const user = ref(null)
const ExportEntries = ref([]);
const Entries = ref([]);
const Devices = ref([]);
let totalMeat = ref(0);
let totalVeg = ref(0);
let totalCarbs = ref(0);
let totalWeight = ref(0);
let TopContributer = ref();
let perAvgWaste = ref();
let StatusOkDeviceCount = ref(0);
const thisWeekEntries = ref([]);
const lastWeekEntries = ref([]);
const weeklyBarChart = ref(null)
let weeklyChartInstance = null
let TopContributor = ref();


const predictionInput = ref([])
const todayWasteKg = ref("0.00")

const fromDate = ref('')
const toDate = ref('')

const carbonBarChart = ref(null)
let carbonChartInstance = null

const CARBON_FACTORS = {
  meat: 27,
  veg: 2,
  carbs: 4
}



function trainLinearRegression(data) {
  const n = data.length
  if (n < 2) return null

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumXX = 0

  data.forEach(p => {
    sumX += p.day
    sumY += p.waste
    sumXY += p.day * p.waste
    sumXX += p.day * p.day
  })

  const slope =
    (n * sumXY - sumX * sumY) /
    (n * sumXX - sumX * sumX)

  const intercept =
    (sumY - slope * sumX) / n

  return { slope, intercept }
}

function predictWaste(day, model) {
  return model.slope * day + model.intercept
}

const nextWeekPrediction = computed(() => {
  if (predictionInput.value.length < 5) {
    return null // not enough data
  }

  const model = trainLinearRegression(predictionInput.value)
  if (!model) return null

  const lastDay = predictionInput.value.length
  let total = 0

  // Predict next 7 days
  for (let i = 1; i <= 7; i++) {
    total += predictWaste(lastDay + i, model)
  }

  return Number(total.toFixed(2))
})



const calculateCarbonKg = (entries) => {
  let total = 0

  entries.forEach(e => {
    total += (e.meatWeight / 1000) * CARBON_FACTORS.meat
    total += (e.vegWeight / 1000) * CARBON_FACTORS.veg
    total += (e.carbWeight / 1000) * CARBON_FACTORS.carbs
  })

  return Number(total.toFixed(2))
}
const renderCarbonBarChart = () => {
  if (!carbonBarChart.value) return

  const thisWeekCarbon = calculateCarbonKg(thisWeekEntries.value)
  const lastWeekCarbon = calculateCarbonKg(lastWeekEntries.value)

  if (carbonChartInstance) {
    carbonChartInstance.destroy()
  }

  carbonChartInstance = new Chart(carbonBarChart.value, {
    type: 'bar',
    data: {
      labels: ['Last Week', 'This Week'],
      datasets: [
        {
          label: 'Carbon Emission (kg CO₂e)',
          data: [lastWeekCarbon, thisWeekCarbon],
          backgroundColor: ['#adb5bd', '#4A4A4A']
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'kg CO₂e'
          }
        }
      }
    }
  })
}
const carbonAnalytics = computed(() => {
  const thisWeekCarbon = calculateCarbonKg(thisWeekEntries.value)
  const lastWeekCarbon = calculateCarbonKg(lastWeekEntries.value)

  if (lastWeekCarbon === 0) {
    return {
      text: "No comparison data available",
      icon: "bi-dash",
      cls: "text-secondary"
    }
  }

  const diffPercent =
    ((thisWeekCarbon - lastWeekCarbon) / lastWeekCarbon) * 100

  const rounded = Math.abs(diffPercent).toFixed(1)

  if (Math.abs(diffPercent) < 5) {
    return {
      text: "Carbon emissions remained stable",
      icon: "bi-dash",
      cls: "text-secondary"
    }
  }

  if (diffPercent < 0) {
    return {
      text: `${rounded}% lower carbon emissions this week`,
      icon: "bi-arrow-down",
      cls: "text-success"
    }
  }

  return {
    text: `${rounded}% higher carbon emissions this week`,
    icon: "bi-arrow-up",
    cls: "text-danger"
  }
})

watch([thisWeekEntries, lastWeekEntries], () => {
  if (
    thisWeekEntries.value.length > 0 ||
    lastWeekEntries.value.length > 0
  ) {
    renderCarbonBarChart()
  }
})



onMounted(async () => {

  const today = new Date()
  const weekAgo = new Date()

  weekAgo.setDate(today.getDate() - 7)
  toDate.value = today.toISOString().split('T')[0]
  fromDate.value = weekAgo.toISOString().split('T')[0]
  

  await fetchDataBasedOnDates();
  await fetchWeeklyEntries();
  await fetchAllEntriesForPrediction() // ML
  console.log("entries for each ");
  console.log(thisWeekEntries,lastWeekEntries);
})
const totalWasteKg = computed(() =>
  predictionInput.value.reduce((sum, d) => sum + d.waste, 0).toFixed(2)
)


watch([fromDate, toDate], ([newFrom, newTo]) => {
  if (newFrom && newTo && newFrom <= newTo) {
    fetchDataBasedOnDates()
  }
})
function calculateTotalWasteForSelectedDates(entries) {
  const totalGrams = entries.reduce(
    (sum, e) => sum + e.totalWeight,
    0
  )
  return Number((totalGrams / 1000).toFixed(2)) // g → kg
}
const totalWasteKgSelected = computed(() => {
  if (!Entries.value.length) return "0.00"
  return calculateTotalWasteForSelectedDates(Entries.value).toFixed(2)
})

const calculateTotalKg = (entries) => {
  const totalGrams = entries.reduce(
    (sum, e) => sum + e.totalWeight,
    0
  )
  return Number((totalGrams / 1000).toFixed(2))
}
const weeklyTrend = computed(() => {
  const thisWeekKg = calculateTotalKg(thisWeekEntries.value)
  const lastWeekKg = calculateTotalKg(lastWeekEntries.value)

  if (
    thisWeekEntries.value.length === 0 &&
    lastWeekEntries.value.length === 0
  ) {
    return {
      text: "No Data",
      icon: "bi-dash",
      cls: "text-secondary"
    }
  }

  const diff = thisWeekKg - lastWeekKg

  if (Math.abs(diff) < 0.1) {
    return {
      text: "Stable",
      icon: "bi-dash",
      cls: "text-secondary"
    }
  }

  if (diff < 0) {
    return {
      text: "Decreasing",
      icon: "bi-arrow-down",
      cls: "text-success"
    }
  }

  return {
    text: "Increasing",
    icon: "bi-arrow-up",
    cls: "text-danger"
  }
})


const topWasteContributor = computed(() => {
  if (thisWeekEntries.value.length === 0) return null

  let totals = {
    meat: 0,
    veg: 0,
    carbs: 0
  }

  thisWeekEntries.value.forEach(e => {
    totals.meat += e.meatWeight
    totals.veg += e.vegWeight
    totals.carbs += e.carbWeight
  })

  // Find highest contributor
  const top = Object.entries(totals).reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    ["", 0]
  )

  return {
    category: top[0],          // meat / veg / carbs
    weightKg: (top[1] / 1000).toFixed(2)
  }
})
const actionableInsight = computed(() => {
  if (!topWasteContributor.value) {
    return "No sufficient data available to generate insights."
  }

  const labelMap = {
    meat: "meat",
    veg: "vegetables",
    carbs: "carbohydrates"
  }

  const item = labelMap[topWasteContributor.value.category]
  TopContributor.value = item;
  return `<strong>${item}</strong> is the top contributor to food waste this week. Portion adjustment is recommended.`

})




/*const ExportCSV = async () => {
  console.log("btn pressed for export cvs")
  console.log(toDate.value, fromDate.value)
  //await fetchDataForCSV();
  //console.log("This si the entries to be exported",ExportEntries)
  const from = fromDate.value;
  const to = toDate.value;

  window.open(
    `http://localhost:3000/api/exportCSV?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    "_blank"
  );
}*/


const ExportCSV = async () => {
  const params = new URLSearchParams({
    from: fromDate.value,
    to: toDate.value,

    weeklyTrend: weeklyTrend.value.text,
    totalWasteKg: totalWasteKgSelected.value,
    todayWasteKg: todayWasteKg.value,
    nextWeekPrediction: nextWeekPrediction.value,
    carbonAnalytics: carbonAnalytics.value.text,
    topContributor: TopContributor.value
  })

  window.open(
    `http://localhost:3000/api/exportCSV?${params.toString()}`,
    "_blank"
  )
}


const fetchDataForCSV = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries', {
      params: {
        fromDate: fromDate.value,
        toDate: toDate.value
      }
    })

    const data = Array.isArray(res.data) ? res.data : []
    ExportEntries.value = [...data]

  } catch (err) {
    console.error(err)
  }
}

const btnClickBack = () => {
  router.push('/DashBoard')
}
const renderWeeklyBarChart = () => {
  if (!weeklyBarChart.value) return

  const thisWeekKg = calculateTotalKg(thisWeekEntries.value)
  const lastWeekKg = calculateTotalKg(lastWeekEntries.value)

  // destroy old chart if re-rendering
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy()
  }

  weeklyChartInstance = new Chart(weeklyBarChart.value, {
    type: 'bar',
    data: {
      labels: ['Last Week', 'This Week'],
      datasets: [
        {
          label: 'Total Waste (kg)',
          data: [lastWeekKg, thisWeekKg],
          backgroundColor: ['#adb5bd', '#4A4A4A']
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Waste (kg)'
          }
        }
      }
    }
  })
}
watch([thisWeekEntries, lastWeekEntries], () => {
  if (
    thisWeekEntries.value.length > 0 ||
    lastWeekEntries.value.length > 0
  ) {
    renderWeeklyBarChart()
  }
})


function groupWasteByDay(entries) {
  const dayMap = {}

  entries.forEach(entry => {
    const date = new Date(entry.timestamp)
    const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD

    if (!dayMap[dayKey]) {
      dayMap[dayKey] = 0
    }

    dayMap[dayKey] += entry.totalWeight
  })

  return dayMap
}

function formatForPrediction(dayMap) {
  const sortedDays = Object.keys(dayMap).sort() // chronological

  return sortedDays.map((date, index) => ({
    day: index + 1,
    waste: Number((dayMap[date] / 1000).toFixed(2)) // convert g → kg
  }))
}

const fetchWeeklyEntries = async () => {
  const today = new Date()
  const lastWeekStart = new Date()
  lastWeekStart.setDate(today.getDate() - 13)

  const thisWeekStart = new Date()
  thisWeekStart.setDate(today.getDate() - 6)

  try {
    const res = await axios.get("http://localhost:3000/api/getAllEntries", {
      params: {
        fromDate: lastWeekStart.toISOString().split("T")[0],
        toDate: today.toISOString().split("T")[0]
      }
    })

    const entries = res.data || []

    thisWeekEntries.value = entries.filter(e =>
      new Date(e.timestamp) >= thisWeekStart
    )

    lastWeekEntries.value = entries.filter(e =>
      new Date(e.timestamp) < thisWeekStart
    )
  } catch (err) {
    console.error(err)
  }
}


const fetchDataBasedOnDates = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries', {
      params: {
        fromDate: fromDate.value,
        toDate: toDate.value
      }
    })

    const data = Array.isArray(res.data) ? res.data : []
    Entries.value = [...data]

    // Compute today's waste
    const today = new Date().toISOString().split('T')[0]

    const todayTotalGrams = data
      .filter(entry => entry.timestamp.startsWith(today))
      .reduce((sum, entry) => sum + entry.totalWeight, 0)

    todayWasteKg.value = (todayTotalGrams / 1000).toFixed(2)

  } catch (err) {
    console.error(err)
  }
}



const fetchAllEntriesForPrediction = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries')

    const data = Array.isArray(res.data) ? res.data : []

    // Group & format for ML
    const grouped = groupWasteByDay(data)
    predictionInput.value = formatForPrediction(grouped)

    console.log("ML prediction input (ALL DATA):", predictionInput.value)

  } catch (err) {
    console.error("Failed to fetch prediction data", err)
  }
}







</script>

<style>

.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.chart-wrapper {
  position: relative;
  height: 200px; 
  width: 100%;
}
.attention-pulse {
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 193, 7, 0.2);
  }
  50% {
    transform: scale(1.01);          /* 👈 was 1.02 */
    box-shadow: 0 0 6px rgba(255, 193, 7, 0.35); /* 👈 smaller glow */
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(255, 193, 7, 0.2);
  }
}



</style>