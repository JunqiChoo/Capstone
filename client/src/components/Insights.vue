

<template>
    <h1>Insights Page</h1>
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




onMounted(async () => {
   
})




</script>

<style>

.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}


</style>