'use client'

import React from 'react'

interface Props {
  contenido: string
}

export default function ContenidoMarkdown({ contenido }: Props) {
  const elementos = parsearMarkdown(contenido)

  return (
    <>
      <style jsx>{`
        .md-code-block {
          background: rgba(0, 0, 0, 0.35);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin: 0.5rem 0;
          overflow-x: auto;
          font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.8rem;
          line-height: 1.6;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .md-code-block code {
          color: #E2E8F0;
          white-space: pre;
        }
        .md-code-lang {
          display: block;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.35);
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .md-inline-code {
          background: rgba(139, 92, 246, 0.15);
          color: #C4B5FD;
          padding: 0.12em 0.4em;
          border-radius: 4px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 0.82em;
          border: 1px solid rgba(139, 92, 246, 0.2);
        }
      `}</style>
      <div>{elementos}</div>
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
        <div className="md-code-block" key={key++}>
          {lenguaje && <span className="md-code-lang">{lenguaje}</span>}
          <code>{bloque.join('\n')}</code>
        </div>
      )
      continue
    }

    if (linea.trim() === '') {
      resultado.push(<br key={key++} />)
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
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)/g
  let ultimo = 0
  let match
  let key = 0

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > ultimo) {
      resultado.push(texto.slice(ultimo, match.index))
    }

    if (match[1]) {
      resultado.push(<strong key={key++}>{match[2]}</strong>)
    } else if (match[3]) {
      resultado.push(<em key={key++}>{match[4]}</em>)
    } else if (match[5]) {
      resultado.push(<code className="md-inline-code" key={key++}>{match[6]}</code>)
    }

    ultimo = match.index + match[0].length
  }

  if (ultimo < texto.length) {
    resultado.push(texto.slice(ultimo))
  }

  return resultado
}
