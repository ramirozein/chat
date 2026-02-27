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
    }}>
      <div style={{
        maxWidth: '75%',
        padding: '0.625rem 0.875rem',
        borderRadius: esMio ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        backgroundColor: esMio
          ? 'rgba(99, 102, 241, 0.85)'
          : 'var(--color-superficie-2)',
        color: esMio ? '#fff' : 'var(--color-texto)',
        wordBreak: 'break-word',
      }}>
        {!esMio && (
          <p style={{
            margin: '0 0 0.25rem 0',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: 'var(--color-acento)',
          }}>
            {autor}
          </p>
        )}
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.4' }}>
          {contenido}
        </p>
        <p style={{
          margin: '0.25rem 0 0 0',
          fontSize: '0.65rem',
          textAlign: 'right',
          opacity: 0.7,
        }}>
          {hora}
        </p>
      </div>
    </div>
  )
}
