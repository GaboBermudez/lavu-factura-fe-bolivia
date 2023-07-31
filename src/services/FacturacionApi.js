import axios from 'axios'

// const url = 'https://lavu-factura-api-bolivia-production.up.railway.app'
const url = 'http://localhost:8080'

export async function enviarFactura(payload) {
  const result = await axios.post(`${url}/facturar`, payload)
  return result.data
}

export async function login(payload) {
  const result = await axios.post(`${url}/login`, payload)
  return result.data
}
