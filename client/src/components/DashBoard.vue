<template>
    <h4 class="welcome-text text-center fst-italic mt-2 mb-4">
        Welcome back, {{ user.username }}
    </h4>

    <div class="container">
        <div class="row">
            <div class="col">
                <div class="card bg-light mb-3">

                    <div class="card-body text-center">
                        <h5 class="card-title">Total Waste</h5>
                        <p class="card-text fw-bold text-dark display-6">{{ (totalWeight / 1000).toFixed(1) }} Kg</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card bg-light mb-3">
                    <div class="card-body text-center">
                        <h5 class="card-title">Average Waste Per</h5>
                        <p class="card-text fw-bold text-dark display-6">{{ perAvgWaste }} g</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card bg-light mb-3">
                    <div class="card-body text-center">
                        <h5 class="card-title">Top Contributor</h5>
                        <p class="card-text fw-bold text-dark display-6">{{ TopContributer }}</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card bg-light mb-3 shadow-sm rounded">
                    <div class="card-body text-center p-4">
                        <!-- Title and Green Circle -->
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">Active Devices</h5>
                            <div
                                class="green-circle d-flex justify-content-center align-items-center text-white fw-bold">
                                1
                            </div>
                        </div>

                        <!-- View Devices Button -->
                        <button class="btn btn-sm btn-outline-secondary w-100" @click="ViewDevices">View
                            Devices</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <div class="container">
        <div class="row">
            <div class="col-8">
                <div class="card bg-light mb-3 large-card">

                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title mb-0">Trend Overtime</h5>
                            <button type="button" class="btn btn-outline-secondary ms-auto"
                                @click="ViewMoreInsights">View More Insights</button>
                        </div>
                        <div class="chart-container">
                            <canvas id="trendChart"></canvas>
                        </div>
                    </div>

                </div>
            </div>
            <div class="col-4">
                <div class="card bg-light mb-3 large-card">
                    <div class="card-body text-center">
                        <h5 class="card-title">Category Breakdown</h5>
                        <canvas id="pieChart" class="pie-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!--Table of device status-->
    <div class="container">
        <div class="row">
            <div class="table-wrap">
                <table class="table table-hover table-sticky mb-0">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Entry Logs</th>
                            <th class="text-end">Meat(g)</th>
                            <th class="text-end">Veg(g)</th>
                            <th class="text-end">Carbs(g)</th>
                            <th class="text-end">Total(g)</th>
                            <th class="text-end" style="width: 140px;">Carbon Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(entry, index) in Entries" :key="index" @click="ViewEntry(entry._id)">
                            <th scope="row">{{ index + 1 }}</th> <!-- Auto increment row number -->
                            <td scope="row">{{ entry.timestamp }}</td>
                            <td class="text-end">{{ entry.meatWeight }}</td>
                            <td class="text-end">{{ entry.vegWeight }}</td>
                            <td class="text-end">{{ entry.carbWeight }}</td>
                            <td class="text-end">{{ entry.totalWeight }}</td>
                            <td class="text-end" style="width: 140px;">
                                <span
                                    class="px-3 py-1 rounded-pill fw-bold d-inline-flex justify-content-center align-items-center gap-1 w-100"
                                    :class="getCarbonStatus(entry).cls">
                                    <i class="bi" :class="getCarbonStatus(entry).icon"></i>
                                    {{ getCarbonStatus(entry).label }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>

    <!--Table of Entry logs-->

</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'



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
} from 'chart.js'

// for line chart
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)
//for bar chart
Chart.register(ArcElement, Tooltip, Legend, PieController)
const router = useRouter()
const user = ref(null)
const Entries = ref([]);
const Devices = ref([]);
let totalMeat = ref(0);
let totalVeg = ref(0);
let totalCarbs = ref(0);
let totalWeight = ref(0);
let TopContributer = ref();
let perAvgWaste = ref();
let StatusOkDeviceCount = ref(0);

import { useToast } from 'vue-toastification'
const toast = useToast()

const ViewDevices = async () => {
    router.push("/Devices");
}
const getProfile = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/getProfile', {
            headers: {
                'x-auth-token': localStorage.getItem('token')
            }
        })
        user.value = res.data
        console.log("Logged-in user:", res.data)
    } catch (err) {
        console.error(err)
        //toast.error('Failed to load profile')
        router.push('/Login')
    }
}

const getAllEntries = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries')

    Entries.value = Array.isArray(res.data)
      ? [...res.data]
      : []
  } catch (err) {
    console.error(err)
  }
}


const CARBON_FACTORS = {
  meat: 27.0,
  veg: 2.0,
  carbs: 1.4
}
const LOW_CARBON = 1.5
const MEDIUM_CARBON = 3.0

const getCarbonStatus = (entry) => {
  const meatKg = (Number(entry.meatWeight) || 0) / 1000
  const vegKg = (Number(entry.vegWeight) || 0) / 1000
  const carbKg = (Number(entry.carbWeight) || 0) / 1000

  const totalCarbon =
    meatKg * CARBON_FACTORS.meat +
    vegKg * CARBON_FACTORS.veg +
    carbKg * CARBON_FACTORS.carbs

  if (totalCarbon <= LOW_CARBON) {
    return {
      label: 'Low',
      cls: 'bg-success text-white',
      icon: 'bi-check-circle'
    }
  } else if (totalCarbon <= MEDIUM_CARBON) {
    return {
      label: 'Average',
      cls: 'bg-warning text-dark',
      icon: 'bi-exclamation-circle'
    }
  } else {
    return {
      label: 'High',
      cls: 'bg-danger text-white',
      icon: 'bi-exclamation-triangle'
    }
  }
}


const getStatusOKDevices = async () => {
    try {
        const res = await axios.get('http://localhost:3000/api/getDevices')
        Devices.value = res.data
        Devices.value.forEach(device => {
            if (device.status === "ok") {
                StatusOkDeviceCount++;
            }
        })
        console.error(err)
    } catch (err) {
        console.log(err);
    }
}
const ViewEntry = async(id)=>{
   router.push(`/ViewEntry/${id}`);
   console.log(id)
}

const insertPieChart = async () => {
    const ctx = document.getElementById('pieChart')
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Meat', 'Veg', 'Carbs'],
            datasets: [{
                label: 'Food Waste (g)',
                data: [totalMeat, totalVeg, totalCarbs], // you can replace this with your real values
                backgroundColor: [
                    'rgba(135, 206, 250, 0.7)',  // Light blue
                    'rgba(65, 105, 225, 0.7)',   // Medium blue
                    'rgba(0, 0, 128, 0.7)'       // Dark blue
                ]
                ,
                borderColor: [
                    'rgba(135, 206, 250, 0.7)',  // Light blue
                    'rgba(65, 105, 225, 0.7)',   // Medium blue
                    'rgba(0, 0, 128, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                   display:false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.formattedValue} g`
                        }
                    }
                }
            }
        }
    })
};

const insertTrendChart = async () => {
  const ctx = document.getElementById('trendChart');

  // ✅ Prepare labels (time) and data (total waste)
  const labels = Entries.value.map(entry =>
    new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  const data = Entries.value.map(entry => entry.totalWeight);

  // ✅ Create the chart
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Total Waste (g)',
        data,
        borderColor: 'rgba(30, 144, 255, 0.9)',     // line color
        backgroundColor: 'rgba(30, 144, 255, 0.3)', // area fill
        fill: true,
        tension: 0.3,                               // smooth curve
        pointRadius: 4,
        pointBackgroundColor: 'rgba(30, 144, 255, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // hide the legend if you don’t need it
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y} g`
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Time' },
          grid: { display: false }
        },
        y: {
          title: { display: true, text: 'Total Waste (g)' },
          beginAtZero: true
        }
      }
    }
  });
};


const ViewMoreInsights = async()=>{
    router.push("/Insight")
}


const ComputeDashBoardData = async () => {
    //loop through the Entries and store the computed data into respective predefined variables
    Entries.value.forEach(entry => {
        totalMeat.value += entry.meatWeight;  // Update reactive totalMeat
        totalVeg.value += entry.vegWeight;    // Update reactive totalVeg
        totalCarbs.value += entry.carbWeight; // Update reactive totalCarbs
        totalWeight.value += entry.totalWeight
    });
    //find the average waste per person
    perAvgWaste = Math.round(totalWeight.value / Entries.value.length); // nearest whole number

    console.log(perAvgWaste)

    //Here we derive which food component is the most amount recorded
    let highestFoodWaste = Math.max(totalMeat, totalVeg, totalCarbs);

    if (highestFoodWaste === totalMeat) {
        TopContributer.value = "MEAT"
    } else if (highestFoodWaste === totalVeg) {
        TopContributer.value = "VEGE"
    } else {
        TopContributer.value = "CARBS"
    }
}

onMounted(async () => {
    await getAllEntries();
    await ComputeDashBoardData()
    await getStatusOKDevices();
    await insertPieChart();
    await insertTrendChart();
    toast(`Welcome back, ${user.value.username} !`, {
  toastClassName: 'white-toast',
})

})

onBeforeMount(async () => {
    await getProfile();
});


</script>

<style>
.card {
height: 120px;
}
.large-card {
  height: 260px !important; /* or whatever height you prefer */
}

.table-wrap {
    height: 400px;
    overflow-y: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
    touch-action: pan-y;
}

.table-wrap::-webkit-scrollbar {
    width: 0;
    height: 0;
}

.table-sticky thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8f9fa;
}

.green-circle {
    width: 40px;
    height: 40px;
    background-color: #28a745;
    /* Green color */
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.pie-chart {
  width: 200px !important;
  height: 200px !important;
  margin: 0 auto; /* centers it horizontally */
}
.chart-container {
  position: relative;
  width: 100%;
  height: 220px;        /* Adjust for your card */
  overflow: hidden;     /* Prevent overflow */
}

#trendChart {
  width: 100% !important;
  height: 100% !important;
}

.welcome-text {
  opacity: 0;
  transform: translateY(-10px);
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}


.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}


</style>