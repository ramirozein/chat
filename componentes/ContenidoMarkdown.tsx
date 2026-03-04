'use client'

import React, { useState } from 'react'

interface Props {
  contenido: string
}

const INLINE_REGEX = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g

/**
 * Renderizador de markdown para mensajes de chat.
 * Soporta: bloques de código con copy, código inline, negritas, itálicas.
 */
export default function ContenidoMarkdown({ contenido }: Props) {
  const elementos = parsearMarkdown(contenido)
  return <div className="md-root">{elementos}</div>
}

function BloqueCodigoUI({ lenguaje, codigo }: { lenguaje: string; codigo: string }) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <>
      <style jsx>{`
        .code-block {
          position: relative;
          background: #0D1117;
          border-radius: 10px;
          margin: 0.6rem 0;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.45rem 0.85rem;
          background: rgba(255, 255, 255, 0.04);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .code-lang {
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.4);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
        }
        .code-copy {
          padding: 0.2rem 0.55rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.55);
          font-size: 0.68rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .code-copy:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.85);
          border-color: rgba(255, 255, 255, 0.2);
        }
        .code-copy.copiado {
          color: #34D399;
          border-color: rgba(52, 211, 153, 0.3);
          background: rgba(52, 211, 153, 0.08);
        }
        .code-body {
          padding: 0.85rem 1rem;
          overflow-x: auto;
        }
        .code-body pre {
          margin: 0;
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace;
          font-size: 0.78rem;
          line-height: 1.65;
          color: #E6EDF3;
          white-space: pre;
          tab-size: 2;
        }
      `}</style>
      <div className="code-block">
        <div className="code-header">
          <span className="code-lang">{lenguaje || 'código'}</span>
          <button className={`code-copy${copiado ? ' copiado' : ''}`} onClick={copiar}>
            {copiado ? 'Copiado' : '⎘ Copiar'}
          </button>
        </div>
        <div className="code-body">
          <pre>{codigo}</pre>
        </div>
      </div>
    </>
  )
}

function parsearMarkdown(texto: string): React.ReactNode[] {
  const lineas = texto.split('\n')
  const resultado: React.ReactNode[] = []
  let i = 0
  let key = 0

  while (i < lineas.length) {
    const linea = lineas[i]

    if (linea.trimStart().startsWith('```')) {
      const lenguaje = linea.trimStart().slice(3).trim()
      const bloque: string[] = []
      i++
      while (i < lineas.length && !lineas[i].trimStart().startsWith('```')) {
        bloque.push(lineas[i])
        i++
      }
      i++

      resultado.push(
        <BloqueCodigoUI key={key++} lenguaje={lenguaje} codigo={bloque.join('\n')} />
      )
      continue
    }

    if (linea.trim() === '') {
      resultado.push(<div key={key++} style={{ height: '0.3rem' }} />)
      i++
      continue
    }

    resultado.push(
      <span key={key++} style={{ display: 'block' }}>
        {parsearInline(linea)}
      </span>
    )
    i++
  }

  return resultado
}

function parsearInline(texto: string): React.ReactNode[] {
  const resultado: React.ReactNode[] = []
  INLINE_REGEX.lastIndex = 0
  let ultimo = 0
  let match
  let key = 0

  while ((match = INLINE_REGEX.exec(texto)) !== null) {
    if (match.index > ultimo) {
      resultado.push(texto.slice(ultimo, match.index))
    }

    if (match[1]) {
      resultado.push(<strong key={key++}>{match[2]}</strong>)
    } else if (match[3]) {
      resultado.push(<em key={key++}>{match[4]}</em>)
    } else if (match[5]) {
      resultado.push(
        <code key={key++} style={{
          background: 'rgba(139, 92, 246, 0.12)',
          color: '#C4B5FD',
          padding: '0.12em 0.4em',
          borderRadius: '5px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '0.82em',
          border: '1px solid rgba(139, 92, 246, 0.18)',
        }}>
          {match[6]}
        </code>
      )
    }

    ultimo = match.index + match[0].length
  }

  if (ultimo < texto.length) {
    resultado.push(texto.slice(ultimo))
  }

  return resultado
}