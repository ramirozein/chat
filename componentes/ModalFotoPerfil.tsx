'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Props {
  abierto: boolean
  onCerrar: () => void
  onSubir: (archivo: File) => Promise<{ ok: boolean; error?: string }>
  fotoActual?: string
  nombre?: string
}

export default function ModalFotoPerfil({ abierto, onCerrar, onSubir, fotoActual, nombre }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  const [modoCamara, setModoCamara] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Limpiar stream de cámara al cerrar o desmontar
  useEffect(() => {
    return () => detenerCamara()
  }, [])

  useEffect(() => {
    if (!abierto) {
      detenerCamara()
      setModoCamara(false)
    }
  }, [abierto])

  function detenerCamara() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  async function abrirCamara() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 512 }, height: { ideal: 512 } },
        audio: false,
      })
      streamRef.current = stream
      setModoCamara(true)
      // Esperar a que el video se monte en el DOM
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos.')
    }
  }

  const capturarFoto = useCallback(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) return
      const archivo = new File([blob], 'captura.png', { type: 'image/png' })
      setArchivoSeleccionado(archivo)
      setPreviewUrl(canvas.toDataURL('image/png'))
      detenerCamara()
      setModoCamara(false)
    }, 'image/png')
  }, [])

  if (!abierto) return null

  function manejarSeleccion(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    if (!archivo.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    if (archivo.size > 10 * 1024 * 1024) {
      setError('La imagen es demasiado grande (máx. 10MB)')
      return
    }

    setError('')
    setArchivoSeleccionado(archivo)
    const url = URL.createObjectURL(archivo)
    setPreviewUrl(url)
  }

  async function manejarConfirmar() {
    if (!archivoSeleccionado) return

    setSubiendo(true)
    setError('')

    const resultado = await onSubir(archivoSeleccionado)

    if (resultado.ok) {
      limpiarYCerrar()
    } else {
      setError(resultado.error || 'Error al subir la foto')
    }

    setSubiendo(false)
  }

  function limpiarYCerrar() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setArchivoSeleccionado(null)
    setError('')
    setSubiendo(false)
    detenerCamara()
    setModoCamara(false)
    onCerrar()
  }

  return (
    <>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }
        .modal-card {
          background: var(--color-fondo-elevado);
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-xl);
          width: 90%;
          max-width: 400px;
          max-height: calc(var(--app-height, 100dvh) - 2rem);
          overflow-y: auto;
          padding: 2rem;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.3s ease-out;
          -webkit-overflow-scrolling: touch;
        }
        .modal-titulo {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-texto);
          margin: 0 0 0.5rem;
          text-align: center;
        }
        .modal-desc {
          font-size: 0.85rem;
          color: var(--color-texto-secundario);
          text-align: center;
          margin: 0 0 1.5rem;
        }
        .preview-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .preview-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--color-borde-activo);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-superficie);
        }
        .preview-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .preview-placeholder {
          font-size: 2.5rem;
          color: var(--color-texto-terciario);
        }
        .camera-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 0.75rem;
        }
        .camera-video {
          width: 240px;
          height: 240px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid var(--color-borde-activo);
          background: #000;
          transform: scaleX(-1);
        }
        .btn-capturar {
          padding: 0.6rem 1.5rem;
          border: none;
          border-radius: var(--radio-md);
          background: linear-gradient(135deg, #22D3EE, #06B6D4);
          color: #FFFFFF;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-capturar:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(34, 211, 238, 0.35);
        }
        .btns-seleccion {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .btn-seleccionar {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-md);
          background: var(--color-superficie);
          color: var(--color-texto);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 44px;
        }
        .btn-seleccionar:hover {
          background: var(--color-primario-contenedor);
          border-color: var(--color-borde-activo);
          color: var(--color-primario);
        }
        .modal-error {
          color: var(--color-error);
          font-size: 0.8rem;
          text-align: center;
          margin-bottom: 0.75rem;
        }
        .btns-accion {
          display: flex;
          gap: 0.75rem;
        }
        .btn-cancelar {
          flex: 1;
          padding: 0.7rem;
          border: 1px solid var(--color-borde);
          border-radius: var(--radio-md);
          background: transparent;
          color: var(--color-texto-secundario);
          font-size: 0.85rem;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          min-height: 44px;
        }
        .btn-cancelar:hover {
          background: var(--color-superficie);
        }
        .btn-confirmar {
          flex: 1;
          padding: 0.7rem;
          border: none;
          border-radius: var(--radio-md);
          background: linear-gradient(135deg, #FF6B2C, #FF8F5C);
          color: #FFFFFF;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          transition: all var(--transicion);
          box-shadow: var(--sombra-primario);
          min-height: 44px;
        }
        .btn-confirmar:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(255, 107, 44, 0.35);
        }
        .btn-confirmar:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .spinner-upload {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #FFF;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="modal-overlay" onClick={limpiarYCerrar}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
          <h3 className="modal-titulo">Foto de Perfil</h3>
          <p className="modal-desc">Sube una imagen o toma una foto con tu cámara</p>

          {modoCamara ? (
            <div className="camera-container">
              <video ref={videoRef} className="camera-video" autoPlay playsInline muted />
              <button className="btn-capturar" onClick={capturarFoto}>
                Capturar
              </button>
            </div>
          ) : (
            <div className="preview-container">
              <div className="preview-circle">
                {previewUrl ? (
                  <img src={previewUrl} alt="Vista previa" />
                ) : fotoActual ? (
                  <img src={fotoActual} alt={nombre || 'Foto de perfil'} />
                ) : (
                  <span className="preview-placeholder">📷</span>
                )}
              </div>
            </div>
          )}

          {!modoCamara && (
            <div className="btns-seleccion">
              <button
                className="btn-seleccionar"
                onClick={() => inputRef.current?.click()}
              >
                Subir foto
              </button>
              <button
                className="btn-seleccionar"
                onClick={abrirCamara}
              >
                Tomar foto
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={manejarSeleccion}
            style={{ display: 'none' }}
          />

          {error && <p className="modal-error">{error}</p>}

          <div className="btns-accion">
            <button className="btn-cancelar" onClick={limpiarYCerrar}>
              Cancelar
            </button>
            <button
              className="btn-confirmar"
              disabled={!archivoSeleccionado || subiendo}
              onClick={manejarConfirmar}
            >
              {subiendo ? <span className="spinner-upload" /> : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
