

<template>

  <div class="container mt-4">
    <div class="row">
  <div class="col">
    <div class="card bg-light mb-3 p-3">
      <form class="row g-3 align-items-end">
        
        <!-- From date -->
        <div class="col-md-5">
          <label for="fromDate" class="form-label fw-semibold">From</label>
          <input
            type="date"
            class="form-control"
            id="fromDate"
            v-model="fromDate"
          />
        </div>

        <!-- To date -->
        <div class="col-md-5">
          <label for="toDate" class="form-label fw-semibold">To</label>
          <input
            type="date"
            class="form-control"
            id="toDate"
            v-model="toDate"
          />
        </div>

        <!-- Apply button -->
        <div class="col-md-2 d-grid">
          <button
            type="button"
            class="btn btn-primary"
            @click="applyDateFilter"
          >
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
            <h5 class="card-title">Today's Waste</h5>
            <p class="card-text fw-bold text-dark display-6">{{ (totalWeight / 1000).toFixed(1) }} Kg</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Weekly Average</h5>
            <p class="card-text fw-bold text-dark display-6">{{ perAvgWaste }} Kg</p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card bg-light mb-3">
          <div class="card-body text-center">
            <h5 class="card-title">Weekly Trend</h5>
            <p class="card-text fw-bold text-dark display-6">{{ TopContributer }}</p>
          </div>
        </div>
      </div>
      

    </div>
  </div>
  <div class="container ">
    <div class="row">
      <div class="col-8">
         <div class="card bg-light mb-3 large-card">
          <div class="card-body text-center">
           <h3>Notification</h3>
          </div>
        </div>
      </div>
      <div class="col-4">
        <div class="card bg-light mb-3 large-card">
          <div class="card-body text-center">
           <h3>Prediction</h3>
          </div>
        </div>
      </div>
    </div>
     <div class="mt-4">
            <button type="button" class="btn btn-secondary" @click="btnClickBack">Back</button>
          </div>
  </div>
  <!--Table of device status-->
  
  
</template>
<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
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



const fromDate = ref('')
const toDate = ref('')
onMounted(async () => {
   
const today = new Date()
  const weekAgo = new Date()
  weekAgo.setDate(today.getDate() - 7)

  // format to YYYY-MM-DD (required by <input type="date">)
  toDate.value = today.toISOString().split('T')[0]
  fromDate.value = weekAgo.toISOString().split('T')[0]

})


const btnClickBack = () => {
  router.push('/DashBoard')
}


</script>

<style>

.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}


</style>