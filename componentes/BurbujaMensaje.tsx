'use client'

import ContenidoMarkdown from './ContenidoMarkdown'

interface Props {
  contenido: string
  autor: string
  esMio: boolean
  hora: string
}

export default function BurbujaMensaje({ contenido, autor, esMio, hora }: Props) {
  return (
    <>
      <style jsx>{`
        .mensaje-wrapper {
          display: flex;
          margin-bottom: 0.2rem;
          animation: fadeIn var(--transicion);
        }
        .mensaje-wrapper.mio {
          justify-content: flex-end;
        }
        .mensaje-wrapper.otro {
          justify-content: flex-start;
        }
        .burbuja {
          max-width: 80%;
          padding: 0.8rem 1.2rem;
          border-radius: 20px;
          word-break: break-word;
          position: relative;
        }
        .burbuja.mio {
          border-bottom-right-radius: 4px;
          background: linear-gradient(135deg, var(--color-primario), #ff8a4f);
          color: #FFFFFF;
          box-shadow: 0 4px 12px -2px rgba(255, 107, 44, 0.3);
        }
        .burbuja.otro {
          border-bottom-left-radius: 4px;
          background: var(--color-superficie);
          color: var(--color-texto);
          box-shadow: var(--sombra-sm);
          border: 1px solid var(--color-borde);
          var(--blur-md);
        }
        .autor-nombre {
          margin: 0 0 0.25rem 0;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primario-hover);
          letter-spacing: 0.02em;
        }
        .contenido {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .hora {
          margin: 0.4rem 0 0 0;
          font-size: 0.65rem;
          text-align: right;
          font-weight: 500;
        }
        .hora.mio {
          color: rgba(255, 255, 255, 0.8);
        }
        .hora.otro {
          color: var(--color-texto-terciario);
        }
      `}</style>
      <div className={`mensaje-wrapper ${esMio ? 'mio' : 'otro'}`}>
        <div className={`burbuja ${esMio ? 'mio' : 'otro'}`}>
          {!esMio && (
            <p className="autor-nombre">
              {autor}
            </p>
          )}
          <div className="contenido">
            <ContenidoMarkdown contenido={contenido} />
          </div>
          <p className={`hora ${esMio ? 'mio' : 'otro'}`}>
            {hora}
          </p>
        </div>
      </div>
    </>
  )
}
