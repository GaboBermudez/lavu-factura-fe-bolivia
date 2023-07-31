import axios from 'axios'
import { useUserStore } from '@/stores/user'

const url = 'https://lavu-factura-api-bolivia-production.up.railway.app'
// const url = 'http://localhost:8080'

export async function enviarFactura(payload) {
  const headers = obtenerAuthHeaders()
  const result = await axios.post(`${url}/facturar`, payload, { headers })
  return result.data
}

export async function login(payload) {
  const result = await axios.post(`${url}/login`, payload)
  return result.data
}

export async function logout() {
  // localStorage.clear()
}

function obtenerAuthHeaders() {
  const userStore = useUserStore()
  return { Authorization: `Bearer ${userStore.authToken}` }
}
