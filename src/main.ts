import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Verificar que JavaScript esté habilitado
if (typeof window === 'undefined') {
  console.error('JavaScript no está disponible en este entorno')
  throw new Error('JavaScript es requerido para ejecutar esta aplicación')
}

// Verificar que el DOM esté disponible
if (typeof document === 'undefined') {
  console.error('DOM no está disponible')
  throw new Error('DOM es requerido para ejecutar esta aplicación')
}

// Verificar que el elemento #app existe
const appElement = document.getElementById('app')
if (!appElement) {
  console.error('Elemento #app no encontrado en el DOM')
  throw new Error('Elemento #app es requerido para montar la aplicación')
}

try {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  app.mount('#app')
  
  console.log('✅ Aplicación Listazo cargada correctamente')
} catch (error) {
  console.error('❌ Error al cargar la aplicación:', error)
  
  // Mostrar mensaje de error en el DOM si es posible
  if (appElement) {
    appElement.innerHTML = `
      <h1>Error de Carga</h1>
      <p>Ha ocurrido un error al cargar la aplicación. Esto puede deberse a problemas de conectividad o configuración del navegador.</p>
      <p>Por favor, recarga la página o contacta al soporte técnico si el problema persiste.</p>
      
      <h2>Sugerencias</h2>
      <p>• Verifica tu conexión a internet</p>
      <p>• Actualiza tu navegador a la última versión</p>
      <p>• Desactiva extensiones que puedan interferir</p>
      <p>• Intenta en modo incógnito</p>
    `
  }
}
