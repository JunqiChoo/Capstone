<template>
  <div class="container">
    <div class="row">
      <div class="col-1"></div>

      <div class="col-10 mt-4">
        <!-- Filters -->
        <div class="d-flex align-items-center gap-3 m-3">
          <button
            type="button"
            class="btn"
            :class="isActive('all') ? 'btn-primary' : 'btn-outline-primary'"
            @click="setFilter('all')"
          >
            ALL
          </button>

          <button
            type="button"
            class="btn"
            :class="isActive('week') ? 'btn-primary' : 'btn-outline-primary'"
            @click="setFilter('week')"
          >
            Past Week
          </button>

          <button
            type="button"
            class="btn"
            :class="isActive('month') ? 'btn-primary' : 'btn-outline-primary'"
            @click="setFilter('month')"
          >
            Past Month
          </button>
        </div>

        <!-- Entry logs -->
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
                  <tr
                    v-for="(entry, index) in Entries"
                    :key="entry._id || index"
                    @click="ViewEntry(entry._id)"
                  >
                    <th scope="row">{{ index + 1 }}</th>
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

          <div class="mt-4">
            <button type="button" class="btn btn-secondary" @click="btnClickBack">Back</button>
          </div>
        </div>
      </div>

      <div class="col-1"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
// import { useToast } from 'vue-toastification'
// const toast = useToast()

const router = useRouter()

const Entries = ref([])
const selectedFilter = ref('all') // 'all' | 'week' | 'month'
const loading = ref(false)

const btnClickBack = () => {
  router.push('/DashBoard')
}

const isActive = (filter) => selectedFilter.value === filter

const setFilter = async (filter) => {
  if (selectedFilter.value === filter) return
  selectedFilter.value = filter
  if(filter ==="all"){
    await fetchEntries()
  }else if(filter ==="week"){
    console.log("week pressed")
  }else if(filter ==="month"){
     console.log("month pressed")
  }
  
}


const fetchEntries = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries')

    const data = Array.isArray(res.data) ? res.data : []

    // reverse order (latest first)
    Entries.value = [...data].reverse()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}


const ViewEntry = async(id)=>{
   router.push(`/ViewEntry/${id}`);
   console.log(id)
}


onMounted(async () => {
  await fetchEntries() // default: 'all'
})
</script>

<style>
.table-wrap {
  height: 500px;
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
.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
