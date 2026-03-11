'use client'

import { useEffect } from 'react'

/**
 * Componente que actualiza la CSS custom property --app-height
 * basándose en el visualViewport real del dispositivo.
 * 
 * Esto resuelve el problema de que `100vh` en móvil incluye la barra
 * de navegación y no reacciona cuando el teclado virtual se abre/cierra.
 */
export default function ViewportHandler() {
  useEffect(() => {
    function actualizarAltura() {
      // visualViewport refleja el viewport real visible (sin incluir teclado virtual)
      const altura = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight

      document.documentElement.style.setProperty('--app-height', `${altura}px`)
    }

    // Setear la altura inicial
    actualizarAltura()

    // Escuchar cambios del visualViewport (teclado abre/cierra, zoom)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', actualizarAltura)
      window.visualViewport.addEventListener('scroll', actualizarAltura)
    }

    // Fallback para navegadores sin visualViewport
    window.addEventListener('resize', actualizarAltura)

    // También manejar cambios de orientación
    window.addEventListener('orientationchange', () => {
      // Delay porque orientationchange dispara antes de que el viewport se actualice
      setTimeout(actualizarAltura, 150)
    })

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', actualizarAltura)
        window.visualViewport.removeEventListener('scroll', actualizarAltura)
      }
      window.removeEventListener('resize', actualizarAltura)
    }
  }, [])

  return null
}
