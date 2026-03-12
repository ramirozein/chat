'use client'

export default function BurbujaEscribiendo() {
  return (
    <>
      <style jsx>{`
        .escribiendo-root {
          display: flex;
          justify-content: flex-start;
          margin-bottom: 0.2rem;
          animation: fadeIn 0.2s ease-out;
        }
        .escribiendo-burbuja {
          padding: 0.85rem 1.2rem;
          border-radius: 20px 20px 20px 4px;
          background: var(--color-superficie);
          border: 1px solid var(--color-borde);
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: var(--sombra-sm);
          var(--blur-md);
        }
        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--color-texto-terciario);
          animation: dotBounce 1.4s ease-in-out infinite;
        }
        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dotBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
      <div className="escribiendo-root">
        <div className="escribiendo-burbuja">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </>
  )
}
