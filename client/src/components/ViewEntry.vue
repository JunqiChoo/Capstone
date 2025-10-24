<template>
  <div class="container">
    <div class="row mt-5">
      <div class="col">
        <div class="card-body bg-light text-center mb-3">
          <h3 class="card-title mb-2">Category Breakdown</h3>
          <canvas id="pieChart" class="pie-chart-entry"></canvas>
        </div>

        <div class="card-body bg-light text-center">
          <h5 class="card-title mb-2">Taken By</h5>
          <h2 v-if="Camera">{{ Camera.deviceName }}</h2>
        </div>
      </div>

      <div class="col">
        <div class="card-body bg-light text-center  insights-card">
          <h3 class="card-title mb-2">Entry Insights</h3>

          <!-- Meat -->
          <label for="range1" class="form-label">Meat: {{ totalMeat }}g</label>
          <div class="d-flex align-items-center justify-content-between">
            <span>{{ minMeat }}g</span>
            <input
              type="range"
              class="form-range custom-range flex-grow-1 mx-3"
              id="range1"
              :min="minMeat"
              :max="maxMeat"
              v-model.number="totalMeat"
              disabled
              :style="{
                '--track-color': COLORS.meat,
                '--fill': fillPct(totalMeat, minMeat, maxMeat) + '%'
              }"
            />
            <span>{{ maxMeat }}g</span>
          </div>

          <!-- Veg -->
          <label for="range2" class="form-label mt-3">Vege: {{ totalVeg }}g</label>
          <div class="d-flex align-items-center justify-content-between">
            <span>{{ minVeg }}g</span>
            <input
              type="range"
              class="form-range custom-range flex-grow-1 mx-3"
              id="range2"
              :min="minVeg"
              :max="maxVeg"
              v-model.number="totalVeg"
              disabled
              :style="{
                '--track-color': COLORS.veg,
                '--fill': fillPct(totalVeg, minVeg, maxVeg) + '%'
              }"
            />
            <span>{{ maxVeg }}g</span>
          </div>

          <!-- Carbs -->
          <label for="range3" class="form-label mt-3">Carbs: {{ totalCarbs }}g</label>
          <div class="d-flex align-items-center justify-content-between">
            <span>{{ minCarbs }}g</span>
            <input
              type="range"
              class="form-range custom-range flex-grow-1 mx-3"
              id="range3"
              :min="minCarbs"
              :max="maxCarbs"
              v-model.number="totalCarbs"
              disabled
              :style="{
                '--track-color': COLORS.carbs,
                '--fill': fillPct(totalCarbs, minCarbs, maxCarbs) + '%'
              }"
            />
            <span>{{ maxCarbs }}g</span>
          </div>

          <!-- Total -->
          <label for="range4" class="form-label mt-3">Total Wastage</label>
          <div class="d-flex align-items-center justify-content-between">
            <span>{{ minMeat + minVeg + minCarbs }}g</span>
            <input
              type="range"
              class="form-range custom-range flex-grow-1 mx-3"
              id="range4"
              :min="minMeat + minVeg + minCarbs"
              :max="maxMeat + maxVeg + maxCarbs"
              v-model.number="totalWeight"
              disabled
              :style="{
                '--track-color': COLORS.total,
                '--fill': fillPct(
                  totalWeight,
                  (minMeat + minVeg + minCarbs),
                  (maxMeat + maxVeg + maxCarbs)
                ) + '%'
              }"
            />
            <span>{{ maxMeat + maxVeg + maxCarbs }}g</span>
          </div>
       <div class="d-flex justify-content-end mt-4">
  <button type="button" class="btn btn-secondary back-btn" @click="BtnClickBack">Back</button>
</div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  PieController,
} from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, PieController)

const route = useRoute()
const router = useRouter()

// 🎨 Blue palette (your colors)
const COLORS = {
  meat:  'rgba(135, 206, 250, 0.7)', // Light blue
  veg:   'rgba(65, 105, 225, 0.7)',  // Medium blue
  carbs: 'rgba(0, 0, 128, 0.7)',     // Dark blue
  total: 'rgba(30, 80, 180, 0.7)'    // Slightly different blue for Total
}

const Entries = ref([])
const Camera = ref(null)

const minMeat = ref(0), maxMeat = ref(0), totalMeat = ref(0)
const minVeg  = ref(0), maxVeg  = ref(0), totalVeg  = ref(0)
const minCarbs= ref(0), maxCarbs= ref(0), totalCarbs= ref(0)
const totalWeight = ref(0)

const cameraID = ref(null)
let pieChart = null

const clamp = (v, min, max) => Math.min(Math.max(v, min), max)
const fillPct = (val, min, max) => {
  const lo = Number(min) ?? 0
  const hi = Number(max) ?? 0
  const v  = Number(val) ?? 0
  if (hi <= lo) return 0
  const pct = ((v - lo) * 100) / (hi - lo)
  return Math.min(100, Math.max(0, pct))
}

const BtnClickBack = ()=>{
    router.push("/Dashboard");
}

const getSelectedEntry = async () => {
  const entryId = route.params.id
  try {
    const res = await axios.get(`http://localhost:3000/api/getEntry/${entryId}`)
    totalMeat.value   = Number(res.data.meatWeight)  || 0
    totalVeg.value    = Number(res.data.vegWeight)   || 0
    totalCarbs.value  = Number(res.data.carbWeight)  || 0
    totalWeight.value = Number(res.data.totalWeight) || (totalMeat.value + totalVeg.value + totalCarbs.value)
    cameraID.value    = res.data.deviceId
  } catch (err) { console.error(err) }
}

const getTakenByPi = async () => {
  if (!cameraID.value) return
  try {
    const res = await axios.get(`http://localhost:3000/api/getDevice/${cameraID.value}`)
    Camera.value = res.data
  } catch (err) { console.error(err) }
}

const calculateSliderMetrics = async () => {
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries')
    Entries.value = res.data || []

    const meat = Entries.value.map(e => Number(e.meatWeight) || 0)
    const veg  = Entries.value.map(e => Number(e.vegWeight)  || 0)
    const carb = Entries.value.map(e => Number(e.carbWeight) || 0)

    minMeat.value = meat.length ? Math.min(...meat) : 0
    maxMeat.value = meat.length ? Math.max(...meat) : 0
    minVeg.value  = veg.length  ? Math.min(...veg)  : 0
    maxVeg.value  = veg.length  ? Math.max(...veg)  : 0
    minCarbs.value= carb.length ? Math.min(...carb) : 0
    maxCarbs.value= carb.length ? Math.max(...carb) : 0

    totalMeat.value  = clamp(totalMeat.value,  minMeat.value,  maxMeat.value)
    totalVeg.value   = clamp(totalVeg.value,   minVeg.value,   maxVeg.value)
    totalCarbs.value = clamp(totalCarbs.value, minCarbs.value, maxCarbs.value)
    totalWeight.value = clamp(
      totalMeat.value + totalVeg.value + totalCarbs.value,
      minMeat.value + minVeg.value + minCarbs.value,
      maxMeat.value + maxVeg.value + maxCarbs.value
    )
  } catch (err) { console.error(err) }
}

const renderPie = () => {
  const ctx = document.getElementById('pieChart')
  if (!ctx) return

  if (pieChart) pieChart.destroy()

  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Meat', 'Veg', 'Carbs'],
      datasets: [{
        label: 'Food Waste (g)',
        data: [totalMeat.value, totalVeg.value, totalCarbs.value],
        backgroundColor: [COLORS.meat, COLORS.veg, COLORS.carbs],
        borderColor: [COLORS.meat, COLORS.veg, COLORS.carbs],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.formattedValue} g`
          }
        }
      }
    }
  })
}

onMounted(async () => {
  await getSelectedEntry()
  await calculateSliderMetrics()
  renderPie()
  await getTakenByPi()
})

watch([totalMeat, totalVeg, totalCarbs], () => {
  if (pieChart) {
    pieChart.data.datasets[0].data = [totalMeat.value, totalVeg.value, totalCarbs.value]
    pieChart.update()
  }
})
</script>

<style>
.pie-chart-entry { width: 350px !important; height: 350px !important; margin: 0 auto; }

/* === Filled blue sliders === */
.custom-range {
  --track-color: rgba(65, 105, 225, 0.7);
  --fill: 0%;
  height: 6px;
  border-radius: 5px;
  appearance: none;
  outline: none;
}
.custom-range:disabled { opacity: 0.9; cursor: not-allowed; }

.custom-range::-webkit-slider-runnable-track {
  height: 6px; border-radius: 5px;
  background: linear-gradient(
    to right,
    var(--track-color) 0%,
    var(--track-color) var(--fill),
    #e9ecef var(--fill),
    #e9ecef 100%
  );
}
.custom-range::-webkit-slider-thumb {
  appearance: none; width: 14px; height: 14px; border-radius: 50%;
  background: #fff; border: 2px solid #777; margin-top: -4px;
}
.custom-range:disabled::-webkit-slider-thumb {
  border-color: #aaa; background: #ddd;
}

/* Firefox */
.custom-range::-moz-range-track {
  height: 6px; border-radius: 5px; background: #e9ecef;
}
.custom-range::-moz-range-progress {
  height: 6px; border-radius: 5px; background: var(--track-color);
}
.custom-range::-moz-range-thumb {
  width: 14px; height: 14px; border-radius: 50%;
  background: #fff; border: 2px solid #777;
}

/* Ensures the button stays pinned to bottom-right inside the card */
.insights-card {
  min-height: 480px;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* pushes button area to bottom */
}

/* optional: small gap and alignment tweak */
.back-btn {
  align-self: flex-end;
  margin-top: auto;
}


</style>
