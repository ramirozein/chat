'use client'

import { useState } from 'react'
import { Input, Button } from '@heroui/react'

interface Props {
  onEnviar: (contenido: string) => void
}

export default function EntradaMensaje({ onEnviar }: Props) {
  const [mensaje, setMensaje] = useState('')

  function manejarEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (mensaje.trim()) {
      onEnviar(mensaje)
      setMensaje('')
    }
  }

  function manejarTecla(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      manejarEnviar(e)
    }
  }

  return (
    <form
      onSubmit={manejarEnviar}
      style={{
        padding: '0.875rem 1.25rem',
        borderTop: '1px solid var(--color-borde)',
        backgroundColor: 'var(--color-superficie)',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
      }}
    >
      <Input
        id="input-mensaje"
        placeholder="Escribe un mensaje..."
        value={mensaje}
        onValueChange={setMensaje}
        onKeyDown={manejarTecla}
        variant="bordered"
        size="lg"
        style={{ flex: 1 }}
      />
      <Button
        id="btn-enviar"
        type="submit"
        color="primary"
        size="lg"
        isDisabled={!mensaje.trim()}
        style={{
          minWidth: 'auto',
          padding: '0 1.25rem',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #6366f1, #818cf8)',
        }}
      >
        Enviar
      </Button>
    </form>
  )
}
