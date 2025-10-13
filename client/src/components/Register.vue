<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">REGISTER</h1>

      <form @submit.prevent="loginUser" class="login-form">
        <input
          type="username"
          class="input-pill"
          placeholder="Username"
          v-model="User.username"
        />
        <input
          type="email"
          class="input-pill"
          placeholder="name@gmail.com"
          v-model="User.email"
        />
        <input
          type="password"
          class="input-pill"
          placeholder="**********"
          v-model="User.password"
        />
         <input
          type="role"
          class="input-pill"
          placeholder="Admin"
          v-model="User.role"
        />
        <button type="button" class="btn-pill btn-register w-75" @click="createAccountClick">
            Register
          </button>
          <a href="#" @click="backToLogin" class="link">Already have an account? Back to login.</a>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
const toast = useToast()
const router = useRouter();
const User = ref({
    username:'',
    email: '',
    password: '',
    role: ''
});
const UrlLink = "http://localhost:3000/api/register"
const backToLogin = async()=>{
  router.push("/login")
}
const createAccountClick = async () => {
    console.log(User.value);
    try {
        const tempData = await axios.post(UrlLink, { ...User.value })
        router.push('/Login');
    } catch (err) {
        console.log(err)
        toast.error("Unable to register to FOODWASTE APP :(")
    }

}
</script>

<style scoped>
/* Stop the page from scrolling & center everything */
:global(html, body) {
  height: 100%;
  overflow: hidden;
}
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #eaeaea; /* light grey like the mock */
}

/* Card */
.login-card {
  width: clamp(320px, 60vw, 720px);   /* ~60% on desktop, never too small/large */
  padding: 2.25rem 2.5rem;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  text-align: center;
}

/* Title (italic, spaced) */
.login-title {
  font-size: clamp(1.6rem, 3.5vw, 2.4rem);
  font-weight: 600;
  font-style: Arial;
  letter-spacing: .12em;
  margin: .25rem 0 1.75rem;
  color: #111;
}

/* Form & inputs (pills) */
.login-form {
  display: grid;
  gap: 1rem;
  justify-items: center;
}

.input-pill {
  width: clamp(240px, 70%, 520px);
  border: none;
  outline: none;
  border-radius: 999px;
  padding: .9rem 1.1rem;
  background: #eae4e4;           /* soft beige/grey like the mock */
  color: #111;
  font-size: 1rem;
}
.input-pill::placeholder { color: #7c7c7c; }
.input-pill:focus {
  box-shadow: 0 0 0 4px rgba(110, 168, 255, .25);
  background: #efebeb;
}

/* Buttons row */
.btn-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

/* Pill buttons */
.btn-pill {
  border: none;
  border-radius: 999px;
  padding: .75rem 1.6rem;
  font-weight: 600;
  min-width: 150px;
  transition: transform .06s ease, filter .15s ease;
}
.btn-pill:active { transform: translateY(1px) scale(0.99); }

/* Register (blue) */
.btn-register {
  background: #8fb6ff;
  color: #0a2340;
}
.btn-register:hover { filter: brightness(0.96); }

/* Login (green) */
.btn-login {
  background: #2ee65b;
  color: #0f3b0f;
}
.btn-login:hover { filter: brightness(0.95); }

/* Small screens: keep proportions nice */
@media (max-width: 480px) {
  .btn-pill { min-width: 120px; padding: .7rem 1.2rem; }
}
.white-toast {
  background-color: #fff !important;
  color: #000 !important;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

</style>
