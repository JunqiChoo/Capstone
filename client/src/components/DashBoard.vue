<template>
    <h4 class="text-center fst-italic mt-2 mb-4">
        Welcome back, {{ user.username }}
    </h4>
    <div class="container">
        <div class="row">
            <div class="col">
                <div class="card bg-light mb-3">

                    <div class="card-body text-center">
                        <h5 class="card-title">Total Waste</h5>
                        <p class="card-text fw-bold text-dark display-6">{{(totalWeight/1000).toFixed(1)}} Kg</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card bg-light mb-3">
                    <div class="card-body text-center">
                        <h5 class="card-title">Average Waste Per</h5>
                        <p class="card-text fw-bold text-dark display-6">{{perAvgWaste}} g</p>
                    </div>
                </div>
            </div>
            <div class="col">
                <div class="card bg-light mb-3">
                    <div class="card-body text-center">
                        <h5 class="card-title">Top Contributor</h5>
                        <p class="card-text fw-bold text-dark display-6">{{TopContributer}}</p>
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
                        <button class="btn btn-sm btn-outline-secondary w-100" @click="ViewDevices">View Devices</button>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <div class="container">
        <div class="row">
            <div class="col-8">
                <div class="card bg-light mb-3">

                    <div class="card-body text-center">
                        <h5 class="card-title">Trend Overtime</h5>
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk of
                            the card's content.</p>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="card bg-light mb-3">
                    <div class="card-body text-center">
                        <h5 class="card-title">Category Breakdown</h5>
                        <p class="card-text">Some quick example text to build on the card title and make up the bulk of
                            the card's content.</p>
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
                        </tr>
                    </thead>
                    <tbody>
                         <tr v-for="(entry, index) in Entries" :key="index">
                            <th scope="row">{{ index + 1 }}</th>  <!-- Auto increment row number -->
                            <td scope="row">{{ entry.timestamp }}</td>
                            <td class="text-end">{{ entry.meatWeight }}</td>
                            <td class="text-end">{{ entry.vegWeight }}</td>
                            <td class="text-end">{{ entry.carbWeight }}</td>
                            <td class="text-end">{{ entry.totalWeight }}</td>
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



const ViewDevices = async()=>{
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

const getAllEntries = async()=>{
     try {
        const res = await axios.get('http://localhost:3000/api/getAllEntries')
        Entries.value = res.data
    } catch (err) {
        console.error(err)
    }
}


const getStatusOKDevices = async()=>{
    try {
        const res = await axios.get('http://localhost:3000/api/getDevices')
        Devices.value = res.data
        Devices.value.forEach(device=>{
            if(device.status==="ok"){
                StatusOkDeviceCount++;
            }
        })
        console.error(err)
    }catch(err){
        console.log(err);
    }
}

const ComputeDashBoardData = async()=>{
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
    }else if (highestFoodWaste === totalVeg){
        TopContributer.value = "VEGE"
    }else{
         TopContributer.value = "CARBS"
    }


}

onMounted(async()=>{
    await getAllEntries();
    await ComputeDashBoardData()
    await getStatusOKDevices();
})

onBeforeMount(async () => {
    await getProfile();
});


</script>

<style>
.card {
    height: 130px;
}

.table-wrap {
    height: 300px;
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
    background-color: #28a745;  /* Green color */
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 25px;
    font-weight: bold;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>