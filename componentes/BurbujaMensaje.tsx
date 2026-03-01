'use client'

interface Props {
  contenido: string
  autor: string
  esMio: boolean
  hora: string
}

export default function BurbujaMensaje({ contenido, autor, esMio, hora }: Props) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: esMio ? 'flex-end' : 'flex-start',
      marginBottom: '0.2rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '0.7rem 1rem',
        borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        backgroundColor: esMio ? '#FF6B2C' : 'var(--color-superficie)',
        color: esMio ? '#FFFFFF' : 'var(--color-texto)',
        wordBreak: 'break-word',
        boxShadow: esMio
          ? '0 2px 12px rgba(255, 107, 44, 0.3)'
          : 'var(--sombra-sm)',
        border: esMio ? 'none' : '1px solid var(--color-borde)',
      }}>
        {!esMio && (
          <p style={{
            margin: '0 0 0.2rem 0',
            fontSize: '0.7rem',
            fontWeight: '700',
            color: 'var(--color-primario-hover)',
            letterSpacing: '0.02em',
          }}>
            {autor}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.88rem', lineHeight: '1.55' }}>
          {contenido}
        </p>
        <p style={{
          margin: '0.3rem 0 0 0',
          fontSize: '0.62rem',
          textAlign: 'right',
          opacity: esMio ? 0.8 : 0.45,
          color: esMio ? '#FFFFFF' : 'var(--color-texto-secundario)',
        }}>
          {hora}
        </p>
      </div>
    </div>
  )
}
