import { createRouter, createWebHistory } from 'vue-router'
import FacturacionView from '@/views/FacturacionView.vue'
import ConfiguracionView from '@/views/ConfiguracionView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: FacturacionView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: ConfiguracionView
    }
  ]
})

export default router
