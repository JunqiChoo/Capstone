<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">FOOD WASTE TRACKER</h1>
      
      <form @submit.prevent="loginUser" class="login-form">
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

        <div class="btn-row">
          <button type="button" class="btn-pill btn-register" @click="ClickRegister">
            Register?
          </button>
          <button type="submit" class="btn-pill btn-login">
            Log in
          </button>
        </div>
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
const User = ref({ email: '', password: '' })
const ClickRegister = async()=>{
  console.log("click register button")
  await router.push("/register");
}
const loginUser = async () => {
  try {
    const res = await axios.post('http://localhost:3000/api/login', {
      email: User.value.email,
      password: User.value.password
    });

    localStorage.setItem('token', res.data.token);
    console.log('Login successful!');
    //router.push('/Home'); // or whatever route you use
    await router.push('/DashBoard')
  } catch (err) {
    console.error(err);
    await router.push("/Login")
    toast(`Invalid email or password. Try again.`, {
      toastClassName: 'white-toast',
    })
    //clear the inputs

    User.value.email = '';
    User.value.password = '';


  }
};

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
  font-weight: 400;
  font-style: italic;
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
