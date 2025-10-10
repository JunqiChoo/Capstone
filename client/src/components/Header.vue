<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand ms-3 fw-bold fs-3" @click="btnHome">FOOD WASTE TRACKER</a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarNav">
      <!--<ul class="navbar-nav">
        <li class="nav-item active">
          <a class="nav-link" @click="btnClickAddEvent" >Create Event</a>
        </li>
         <li class="nav-item active">
          <a class="nav-link" @click="btnClickCompletedEvent" >Completed Event</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" @click="btnClickRewards">Rewards</a>
        </li>
      </ul>
      -->
      <!-- Logout Button floated right -->
      <button class="btn btn-outline-secondary ms-auto me-3" @click="btnLogOut">Logout</button>
    </div>
  </nav>
</template>



<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'
//import { useToast } from 'vue-toastification'

//const toast = useToast();

const user = ref(null)

defineOptions({
  //name: 'Header'
})

const router = useRouter()

const btnClickAddEvent = () => {
  //router.push('/addEvent')
}

const btnClickCompletedEvent = async()=>{
  //router.push(`/completedEvent/${user.value._id}`)
}


const btnHome = async()=>{
  //router.push("/home")
}
const btnClickRewards = async()=>{
  //router.push("/rewards")
}

const btnLogOut = async()=>{
  localStorage.removeItem("token"); 
  //toast.success(`Log out successful`)
  router.push("/Login");
}


const getProfile = async () => {
 /* try {
    const res = await axios.get('http://localhost:3000/api/getProfile', {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    })
    user.value = res.data
    console.log("Logged-in user:", res.data)
  } catch (err) {
    console.error(err)
    toast.error('Failed to load profile')
    router.push('/login')
  }*/
}


onMounted(async() => {
  //await getProfile();

  
})

</script>