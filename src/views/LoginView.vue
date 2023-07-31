<template>
  <main>
    <div class="login-container">
      <Card class="login-card">
        <template #title>Iniciar sesión</template>
        <template #content>
          <div class="p-fluid flex flex-column gap-3">
            <div class="p-field">
              <label for="email">Nombre de usuario</label>
              <InputText id="email" v-model="username" />
            </div>
            <div class="p-field">
              <label for="password">Contraseña</label>
              <Password id="password" v-model="password" :feedback="false" toggleMask />
            </div>
            <Button label="Login" @click="loginHandler" />
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { login } from '@/services/FacturacionApi.js'

const router = useRouter()

const username = ref('')
const password = ref('')

const loginHandler = () => {
  // Perform login logic here
  
  console.log('Username:', username.value)
  console.log('Password:', password.value)

  login( { username: username.value, password: password.value })

  router.push('/')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-card {
  max-width: 350px;
  width: 100%;
  padding: 1rem;
}
</style>
