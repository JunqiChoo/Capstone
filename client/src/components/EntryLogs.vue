<template>

  <div class="container">

    <div class="row">
      <div class="col-4 mt-4">

        <!-- <h2>{{ selectedStall?.name || 'Select Stall' }}</h2> -->

        <div class="mt-3">
          <img src="@/assets/stallgen.png" class="food-image mb-3" alt="Food waste image" />
        </div>

        <div class="dropdown w-100">
          <button class="btn btn-outline-primary dropdown-toggle w-100 text-start fw-bold py-2"
            data-bs-toggle="dropdown">
            {{ selectedStall?.name || 'Select Stall' }}
          </button>

          <ul class="dropdown-menu w-100">
            <li v-for="stall in stalls" :key="stall.id">
              <a class="dropdown-item fw-semibold" href="#" @click.prevent="selectStall(stall)">
                {{ stall.name }}
              </a>
            </li>
          </ul>
        </div>


        <div class="card-entry-log bg-light mb-3 mt-2 p-2">
          <div class="card-body p-2">
            <h5>Stall ID : {{ selectedStall?.id }}</h5>
            <br></br>
            <div v-if="selectedStall">
              <p><strong>Cuisine:</strong> {{ selectedStall?.cuisine }}</p>
              <p><strong>Contact:</strong> {{ selectedStall?.contact }}</p>
              <p><strong>Email:</strong> {{ selectedStall?.email }}</p>
            </div>
          </div>
        </div>
        <div class="card-entry bg-light mb-3 mt-2 p-2">
          <div class="card-body text-center m-2">
            <div>
              <h5 class="mb-0">
                WASTE :
                <strong>
                  {{ (wasteBreakdown.total / 1000).toFixed(2) }} kg
                </strong>

              </h5>
            </div>
            <div class="row text-center mb-3 mt-4">
              <div class="col-4">
                <div class="p-2 text-white fw-bold rounded bg-secondary">
                  MEAT<br>{{ wasteBreakdown.meatPct }}%
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 text-white fw-bold rounded bg-secondary">
                  VEGE<br>{{ wasteBreakdown.vegPct }}%
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 text-white fw-bold rounded bg-secondary">
                  CARBS<br>{{ wasteBreakdown.carbsPct }}%
                </div>
              </div>
            </div>

            <!-- Waste -->

          </div>
        </div>



      </div>
      <div class="col-8">

        <div class="container">



          <div class="row">


            <div class="col mt-4">
              <!-- Filters -->
              <div class="d-flex align-items-center gap-3 m-3">
                <button type="button" class="btn" :class="isActive('all') ? 'btn-primary' : 'btn-outline-primary'"
                  @click="setFilter('all')">
                  ALL
                </button>
                <button type="button" class="btn" :class="isActive('today') ? 'btn-primary' : 'btn-outline-primary'"
                  @click="setFilter('today')">
                  Today
                </button>

                <button type="button" class="btn" :class="isActive('week') ? 'btn-primary' : 'btn-outline-primary'"
                  @click="setFilter('week')">
                  Past Week
                </button>

                <button type="button" class="btn" :class="isActive('month') ? 'btn-primary' : 'btn-outline-primary'"
                  @click="setFilter('month')">
                  Past Month
                </button>

              </div>

              <!-- Entry logs -->
              <div class="container">
                <div class="row">
                  <div class="table-wrap-entries">
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
                        <tr v-for="(entry, index) in Entries" :key="entry._id || index" @click="ViewEntry(entry._id)">
                          <th scope="row">{{ index + 1 }}</th>
                          <td scope="row">{{ entry.timestamp }}</td>
                          <td class="text-end">{{ entry.meatWeight }}</td>
                          <td class="text-end">{{ entry.vegWeight }}</td>
                          <td class="text-end">{{ entry.carbWeight }}</td>
                          <td class="text-end">{{ entry.totalWeight }}</td>
                          <td class="text-end">
                          <td class="text-end" style="width: 140px;">
                            <span
                              class="px-3 py-1 rounded-pill fw-bold d-inline-flex justify-content-center align-items-center gap-1 w-100"
                              :class="getCarbonStatus(entry).cls">
                              <i class="bi" :class="getCarbonStatus(entry).icon"></i>
                              {{ getCarbonStatus(entry).label }}
                            </span>
                          </td>

                          </td>

                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="mt-4 text-end">
                  <button type="button" class="btn btn-secondary" @click="btnClickBack">Back</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>



</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
// import { useToast } from 'vue-toastification'
// const toast = useToast()

const router = useRouter()
const Entries = ref([])
const selectedFilter = ref('all') // 'all' | 'week' | 'month'
const loading = ref(false)


const fromAWeekAgoDate = ref('')
const toDate = ref('')
const fromAMonthAgoDate = ref('')
const stalls = [
  {
    id: 1,
    name: 'Mixed Vegetable Rice Stall',
    cuisine: 'Chinese',
    email: 'johndoe@gmail.com',
    contact: '9123 4567'
  },
  {
    id: 2,
    name: 'Western Grill Stall',
    cuisine: 'Western',
    email: 'westernwednesday@gmail.com',
    contact: '9234 5678'
  },
  {
    id: 3,
    name: 'Chicken Rice Stall',
    cuisine: 'Chinese',
    email: 'mrchicken@gmail.com',
    contact: '9345 6789'
  },
  {
    id: 4,
    name: 'Mini Wok Stall',
    cuisine: 'Chinese (Zi Char)',
    email: 'miniwok@email.com',
    contact: '9456 7890'
  }
]

const wasteBreakdown = computed(() => {
  let meat = 0
  let veg = 0
  let carbs = 0

  if (!Array.isArray(Entries.value)) {
    return {
      meatPct: 0,
      vegPct: 0,
      carbsPct: 0,
      total: 0
    }
  }

  Entries.value.forEach(entry => {
    meat += Number(entry.meatWeight) || 0
    veg += Number(entry.vegWeight) || 0
    carbs += Number(entry.carbWeight) || 0
  })

  const total = meat + veg + carbs

  return {
    meat,
    veg,
    carbs,
    total,
    meatPct: total ? Math.round((meat / total) * 100) : 0,
    vegPct: total ? Math.round((veg / total) * 100) : 0,
    carbsPct: total ? Math.round((carbs / total) * 100) : 0
  }
})



const selectedStall = ref(stalls[0])

function selectStall(stall) {
  selectedStall.value = stall
  console.log('Selected stall ID:', stall.id)
}

const btnClickBack = () => {
  router.push('/DashBoard')
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

const isActive = (filter) => selectedFilter.value === filter

const setFilter = async (filter) => {
  if (selectedFilter.value === filter) return
  selectedFilter.value = filter
  if (filter === "all") {
    await fetchEntries()
  } else if (filter === "week") {
    await fetchPastWeek()
    console.log("week pressed")
  } else if (filter === "month") {
    await fetchPastMonth();
    console.log("month pressed")
  }
  else if (filter === "today") {
    await fetchToday();
    console.log("today pressed")
  }

}

const fetchPastWeek = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries', {
      params: {
        fromDate: fromAWeekAgoDate.value,
        toDate: toDate.value,
        stallId: selectedStall.value?.id
      }
    });


    const data = Array.isArray(res.data) ? res.data : []

    // reverse order (latest first)
    Entries.value = [...data]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }

}
const applyCurrentFilter = async () => {
  if (selectedFilter.value === 'all') {
    await fetchEntries()
  } else if (selectedFilter.value === 'today') {
    await fetchToday()
  } else if (selectedFilter.value === 'week') {
    await fetchPastWeek()
  } else if (selectedFilter.value === 'month') {
    await fetchPastMonth()
  }
}

watch(selectedStall, async (newStall) => {
  if (!newStall) return
  await applyCurrentFilter()
})



const fetchToday = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries', {
      params: {
        fromDate: toDate.value,
        toDate: toDate.value,
        stallId: selectedStall.value?.id
      }
    });


    const data = Array.isArray(res.data) ? res.data : []

    // reverse order (latest first)
    Entries.value = [...data]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }

}

const fetchPastMonth = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries', {
      params: {
        fromDate: fromAMonthAgoDate.value,
        toDate: toDate.value,
        stallId: selectedStall.value?.id
      }
    });


    const data = Array.isArray(res.data) ? res.data : []

    // reverse order (latest first)
    Entries.value = [...data]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }

}


const fetchEntries = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/getAllEntries', {
      params: {
        stallId: selectedStall.value?.id
      }
    })
    const data = Array.isArray(res.data) ? res.data : []

    // reverse order (latest first)
    Entries.value = [...data]
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}


const ViewEntry = async (id) => {
  router.push(`/ViewEntry/${id}`);
  console.log(id)
}



onMounted(async () => {
  await fetchEntries() // default: 'all'
  const today = new Date()
  toDate.value = today.toISOString().split('T')[0]

  //for a week ago From Date
  const weekAgo = new Date()
  weekAgo.setDate(today.getDate() - 7)

  fromAWeekAgoDate.value = weekAgo.toISOString().split('T')[0]

  //for a month ago From Date
  const mthAgo = new Date()
  mthAgo.setDate(today.getDate() - 30)
  fromAMonthAgoDate.value = mthAgo.toISOString().split('T')[0]

  console.log(toDate, fromAWeekAgoDate, fromAMonthAgoDate);

})
</script>

<style>
.table-wrap-entries {
  height: 610px;
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

.food-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 4px;
}

.card-entry-log {
  height: 200px;
  border-radius: 4px;
}

.card-entry {
  height: 150px;
  border-radius: 4px;
}
</style>
