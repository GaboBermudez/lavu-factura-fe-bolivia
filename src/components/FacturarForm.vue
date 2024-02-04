<template>
  <div>
    <Toast />
    <ConfirmDialog>
      <template #message>
        <div class="flex flex-column gap-5 p-5">
          <h3 class="font-semibold">
            ¿Está seguro que desea facturar la orden con los siguientes datos?
          </h3>
          <ul>
            <li>
              Orden de LAVU: <span class="font-semibold">{{ orderId }}</span>
            </li>
            <li>
              Método de pago: <span class="font-semibold">{{ metodoDePagoLabel }}</span>
            </li>
            <li v-if="pagoTarjeta">
              Número de tarjeta: <span class="font-semibold">{{ numeroTarjeta }}</span>
            </li>
            <div v-if="esContribuyente">
              <li>
                Documento de identidad:
                <span class="font-semibold">{{ documentodeIdentidadLabel }}</span>
              </li>
              <li>
                Nombre/Razón Social: <span class="font-semibold">{{ nombreRazonSocial }}</span>
              </li>
              <li>
                Número de identificación: <span class="font-semibold">{{ numeroDocumento }}</span>
              </li>
              <li>
                Email: <span class="font-semibold">{{ emailCliente }}</span>
              </li>
            </div>
          </ul>
        </div>
      </template>
    </ConfirmDialog>
    <LoadingOverlay v-if="showLoadingSpinner" />
    <h1 class="mb-0 mt-5">Facturar</h1>
    <Divider class="mt-0" />
    <div class="flex flex-column gap-4">
      <div class="flex flex-column gap-2">
        <label for="orderId">Orden de LAVU</label>
        <InputText required id="orderId" type="text" v-model="orderId" />
      </div>
      <div class="flex flex-column gap-2">
        <label for="codigoMetodoPago">Método de pago</label>
        <Dropdown
          id="codigoMetodoPago"
          v-model="codigoMetodoPago"
          :options="metodosPago"
          optionLabel="descripcion"
          optionValue="codigo"
        />
      </div>
      <Transition>
        <div v-if="pagoTarjeta" class="flex flex-column gap-2">
          <div class="flex justify-content-between">
            <div class="flex flex-column">
              <label for="primerosDigitosTarjeta">Primeros 4 dígitos de la tarjeta</label>
              <InputText
                inputId="primerosDigitosTarjeta"
                type="text"
                v-model="primerosNumsTarjeta"
              />
            </div>
            <div class="flex flex-column">
              <label for="ultimosDigitosTarjeta">Últimos 4 dígitos de la tarjeta</label>
              <InputText inputId="ultimosDigitosTarjeta" type="text" v-model="ultimosNumsTarjeta" />
            </div>
          </div>
          <InlineMessage severity="info"
            >Debe ingresar número de tarjeta si método de pago es TARJETA</InlineMessage
          >
        </div>
      </Transition>
      <div class="card flex justify-content-center">
        <span>Consumidor Final</span>
        <InputSwitch class="mx-2" v-model="esContribuyente" />
        <span>Contribuyente</span>
      </div>
      <Transition>
        <div v-if="esContribuyente">
          <h2 class="mb-2">Datos del cliente</h2>
          <div class="flex flex-column gap-4">
            <div class="flex flex-column gap-2">
              <label for="codigoTipoDocumentoIdentidad">Documento de Identidad</label>
              <Dropdown
                id="codigoTipoDocumentoIdentidad"
                v-model="codigoTipoDocumentoIdentidad"
                :options="documentosIdentidad"
                optionLabel="descripcion"
                optionValue="codigo"
              />
            </div>
            <div class="flex flex-column gap-2">
              <label for="nombre">Nombre - Razón Social</label>
              <InputText id="nombre" type="text" v-model="nombreRazonSocial" />
            </div>
            <div class="flex flex-column gap-2">
              <label for="ruc">Número de identidad</label>
              <InputText id="ruc" type="text" v-model="numeroDocumento" />
            </div>
            <div class="flex flex-column gap-2">
              <label for="email">Email</label>
              <InputText id="email" type="text" v-model="emailCliente" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <Button :disabled="!enableFacturarBtn" class="my-5" label="FACTURAR" @click="confirmFactura" />
  </div>
</template>

<script setup>
import Button from 'primevue/button'
import ConfirmDialog from 'primevue/confirmdialog'
import Divider from 'primevue/divider'
import Dropdown from 'primevue/dropdown'
import InlineMessage from 'primevue/inlinemessage'
import InputSwitch from 'primevue/inputswitch'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { computed, onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { enviarFactura } from '@/services/FacturacionApi'
import { useUserStore } from '@/stores/user'
import { getUserData } from '@/services/FacturacionApi.js'

const documentosIdentidad = [
  {
    codigo: 1,
    descripcion: 'CI - CEDULA DE IDENTIDAD'
  },
  {
    codigo: 2,
    descripcion: 'CEX - CEDULA DE IDENTIDAD DE EXTRANJERO'
  },
  {
    codigo: 3,
    descripcion: 'PAS - PASAPORTE'
  },
  {
    codigo: 4,
    descripcion: 'OD - OTRO DOCUMENTO DE IDENTIDAD'
  },
  {
    codigo: 5,
    descripcion: 'NIT - NÚMERO DE IDENTIFICACIÓN TRIBUTARIA'
  }
]

const metodosPago = [
  {
    codigo: 1,
    descripcion: 'EFECTIVO'
  },
  {
    codigo: 2,
    descripcion: 'TARJETA'
  },
  {
    codigo: 7,
    descripcion: 'TRANSFERENCIA BANCARIA'
  },
  {
    codigo: 10,
    descripcion: 'EFECTIVO - TARJETA',
    isActive: 1
  },
  {
    codigo: 13,
    descripcion: 'EFECTIVO – TRANSFERENCIA BANCARIA',
    isActive: 1
  },
  {
    codigo: 18,
    descripcion: 'TARJETA - TRANSFERENCIA BANCARIA',
    isActive: 1
  }
]

const userStore = useUserStore()
onMounted(async () => {
  const userData = await getUserData()
  userStore.setUserData({ userId: userData.id, nombre: userData.nombre })
})

// Form values
const orderId = ref('')
const esContribuyente = ref(false)
const codigoMetodoPago = ref(1)
const primerosNumsTarjeta = ref('')
const ultimosNumsTarjeta = ref('')
const codigoTipoDocumentoIdentidad = ref(1)
const nombreRazonSocial = ref('')
const numeroDocumento = ref('')
const emailCliente = ref('')

const numeroTarjeta = computed(() => {
  return Number(`${primerosNumsTarjeta.value}00000000${ultimosNumsTarjeta.value}`)
})

// Form manipulation
const pagoTarjeta = computed(
  () =>
    codigoMetodoPago.value === 2 || codigoMetodoPago.value === 10 || codigoMetodoPago.value === 18
)
const pagoTarjetaValido = computed(() => {
  if (!pagoTarjeta.value) {
    return true
  } else {
    return primerosNumsTarjeta.value && ultimosNumsTarjeta.value
  }
})
const datosClienteCompletos = computed(() => {
  return nombreRazonSocial.value && numeroDocumento.value && emailCliente.value
})
const enableFacturarBtn = computed(() => {
  if (orderId.value && !esContribuyente.value) {
    return pagoTarjetaValido.value
  } else {
    return orderId.value && datosClienteCompletos.value && pagoTarjetaValido.value
  }
})

// Toast messages
const toast = useToast()

const showSucessToast = () => {
  toast.add({
    severity: 'success',
    summary: 'Factura emitida exitosamente',
    detail: `Factura para la orden ${orderId.value} enviada con éxito`,
    life: 15000
  })
}

const showFailToast = (response) => {
  let detail = `Hubo un problema al facturar la orden ${orderId.value}`
  if (response.data && response.data.errors && response.data.errors.length > 0) {
    if (response.data.errors[0].startsWith('Ya se encuentra registrada una factura')) {
      detail = `La orden ${orderId.value} ya fue facturada previamente`
    }
  }
  toast.add({
    severity: 'error',
    summary: `Error al facturar orden ${orderId.value}`,
    detail,
    life: 15000
  })
}

// Confirmar factura
const confirm = useConfirm()
const metodoDePagoLabel = computed(() => {
  const { descripcion } = metodosPago.find((metodo) => {
    return metodo.codigo === codigoMetodoPago.value
  })
  return descripcion
})
const documentodeIdentidadLabel = computed(() => {
  const { descripcion } = documentosIdentidad.find((documento) => {
    return documento.codigo === codigoTipoDocumentoIdentidad.value
  })
  return descripcion
})

const limpiarCampos = () => {
  orderId.value = ''
  esContribuyente.value = false
  codigoMetodoPago.value = 1
  primerosNumsTarjeta.value = 0
  ultimosNumsTarjeta.value = 0
  codigoTipoDocumentoIdentidad.value = 1
  nombreRazonSocial.value = ''
  numeroDocumento.value = ''
  emailCliente.value = ''
}

const confirmFactura = () => {
  let message = `¿Desea facturar la orden ${orderId.value}?`
  if (esContribuyente.value) message = `${message} \nRecuerde revisar los datos del cliente.`

  confirm.require({
    message,
    header: 'Confirmación de factura',
    icon: 'pi pi-exclamation-triangle',
    accept: facturar,
    acceptLabel: 'Sí',
    reject: () => {}
  })
}

// Facturacion
const showLoadingSpinner = ref(false)

const facturar = async () => {
  try {
    showLoadingSpinner.value = true
    const payload = {
      orderId: orderId.value.trim(),
      esControlTributario: !esContribuyente.value,
      codigoTipoDocumentoIdentidad: codigoTipoDocumentoIdentidad.value,
      codigoMetodoPago: codigoMetodoPago.value,
      numeroTarjeta: numeroTarjeta.value,
      nombreRazonSocial: nombreRazonSocial.value,
      numeroDocumento: numeroDocumento.value,
      emailCliente: emailCliente.value
    }
    await enviarFactura(payload)
    showSucessToast()
    limpiarCampos()
  } catch (e) {
    showFailToast(e.response)
  } finally {
    showLoadingSpinner.value = false
  }
}
</script>

<style>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
