import { createRouter, createWebHistory } from 'vue-router'

//add all the pages from the component folder
import Login from "../src/components/Login.vue"
import Register from "../src/components/Register.vue"
import DashBoard from "../src/components/DashBoard.vue"
import Devices from "../src/components/Devices.vue"
import Insight from "../src/components/Insights.vue"
import ViewEntry from "../src/components/ViewEntry.vue"
import EntryLogs from "../src/components/EntryLogs.vue"
//define the routes with the necedssary /xxx
const routes = [
    {
        path: '/Login',
        name: 'Login', 
        component: Login ,
        meta: { showNavbar: false }
    },
    {
        path: '/register',
        name: 'Register', 
        component: Register ,
        meta: { showNavbar: false }
    },
     {
        path: '/DashBoard',
        name: 'DashBoard', 
        component: DashBoard ,
        meta: { showNavbar: true }
    },
      {
        path: '/Devices',
        name: 'Devices', 
        component: Devices ,
        meta: { showNavbar: true }
    },
    {
        path: '/Insight',
        name: 'Insight', 
        component: Insight ,
        meta: { showNavbar: true }
    },
    {
        path: '/ViewEntry/:id',
        name: 'ViewEntry', 
        component: ViewEntry ,
        meta: { showNavbar: true }
    },
    {
        path: '/EntryLogs',
        name: 'EntryLogs', 
        component: EntryLogs ,
        meta: { showNavbar: true }
    },

    //EntryLogs

]

//export the route
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router