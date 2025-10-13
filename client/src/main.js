import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import router from '../Router/router.js'
import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap' 
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

createApp(App).use(Toast).use(router).mount('#app')
