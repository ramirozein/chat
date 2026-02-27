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
      marginBottom: '0.25rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '0.75rem 1rem',
        borderRadius: esMio ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        backgroundColor: esMio ? '#F97316' : '#FFFFFF',
        color: esMio ? '#FFFFFF' : 'var(--color-texto)',
        wordBreak: 'break-word',
        boxShadow: esMio
          ? '0 2px 8px rgba(249, 115, 22, 0.25)'
          : '0 1px 4px rgba(0, 0, 0, 0.06)',
        border: esMio ? 'none' : '1px solid var(--color-borde)',
      }}>
        {!esMio && (
          <p style={{
            margin: '0 0 0.25rem 0',
            fontSize: '0.72rem',
            fontWeight: '600',
            color: '#F97316',
          }}>
            {autor}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
          {contenido}
        </p>
        <p style={{
          margin: '0.3rem 0 0 0',
          fontSize: '0.65rem',
          textAlign: 'right',
          opacity: esMio ? 0.85 : 0.5,
        }}>
          {hora}
        </p>
      </div>
    </div>
  )
}
