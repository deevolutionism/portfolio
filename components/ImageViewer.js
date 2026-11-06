import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import originals from '../lib/image-viewer-sources.json'
import { getContentAssetBaseUrl } from '../lib/asset-urls.mjs'

const ViewerContext = createContext(null)

export function useImageViewer() {
  return useContext(ViewerContext)
}

function viewingSource(src) {
  const base = `${getContentAssetBaseUrl()}/`
  if (!src.startsWith(base)) return src
  const key = decodeURIComponent(src.slice(base.length).split(/[?#]/)[0])
  return originals[key] ? `${base}${originals[key]}` : src
}

export function ImageViewerProvider({ children }) {
  const [image, setImage] = useState(null)
  const router = useRouter()
  const close = useCallback(() => setImage(null), [])
  const open = useCallback(({ src, alt }) => {
    if (src) setImage({ src: viewingSource(src), alt: alt || 'Image preview' })
  }, [])

  useEffect(() => {
    router.events.on('routeChangeStart', close)
    return () => router.events.off('routeChangeStart', close)
  }, [router.events, close])

  return (
    <ViewerContext.Provider value={open}>
      {children}
      {image && <ImageViewer key={image.src} image={image} onClose={close} />}
    </ViewerContext.Provider>
  )
}

function ImageViewer({ image, onClose }) {
  const dialogRef = useRef(null)
  const stageRef = useRef(null)
  const panRef = useRef(null)
  const movedRef = useRef(false)
  const imagePointerRef = useRef(false)
  const previousCanvas = useRef(null)
  const titleId = useId()
  const [natural, setNatural] = useState(null)
  const [area, setArea] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(1)
  const [failed, setFailed] = useState(false)
  const fit = natural && area.width ? Math.min(natural.width, Math.max(1, area.width - 32), Math.max(1, area.height - 32) * natural.width / natural.height) : 0
  const width = fit * zoom
  const height = natural ? width * natural.height / natural.width : 0
  const maxZoom = fit ? Math.max(4, natural.width / fit * 2) : 4
  const zoomTo = (value) => setZoom(Math.min(maxZoom, Math.max(1, value)))
  const canPan = width > area.width || height > area.height

  useEffect(() => {
    const dialog = dialogRef.current
    const opener = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const stage = stageRef.current
    // Scrollbar appearance must not change the fit scale or actual-size zoom.
    const observer = new ResizeObserver(() => setArea({ width: stage.offsetWidth, height: stage.offsetHeight }))
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    const stage = stageRef.current
    const previous = previousCanvas.current
    const x = previous ? (stage.scrollLeft + area.width / 2) / previous.width : 0.5
    const y = previous ? (stage.scrollTop + area.height / 2) / previous.height : 0.5
    stage.scrollLeft = x * stage.scrollWidth - area.width / 2
    stage.scrollTop = y * stage.scrollHeight - area.height / 2
    previousCanvas.current = { width: stage.scrollWidth, height: stage.scrollHeight }
  }, [width, height, area])

  function startPan(event) {
    movedRef.current = false
    imagePointerRef.current = event.target.tagName === 'IMG'
    if (event.pointerType !== 'mouse' || event.button !== 0 || !canPan || event.target.tagName !== 'IMG') return
    const stage = stageRef.current
    panRef.current = { x: event.clientX, y: event.clientY, left: stage.scrollLeft, top: stage.scrollTop }
    stage.setPointerCapture(event.pointerId)
  }

  function movePan(event) {
    const pan = panRef.current
    if (!pan) return
    const dx = event.clientX - pan.x
    const dy = event.clientY - pan.y
    if (Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true
    stageRef.current.scrollLeft = pan.left - dx
    stageRef.current.scrollTop = pan.top - dy
  }

  function stopPan(event) {
    panRef.current = null
    if (stageRef.current.hasPointerCapture(event.pointerId)) stageRef.current.releasePointerCapture(event.pointerId)
  }

  function handleStageClick(event) {
    // Pointer capture retargets clicks to the stage after a mouse pan begins.
    const clickedImage = event.target.tagName === 'IMG' || imagePointerRef.current
    imagePointerRef.current = false
    if (movedRef.current) return
    if (clickedImage && natural && fit) zoomTo(zoom === 1 ? Math.max(2, natural.width / fit) : 1)
    else if (event.target === event.currentTarget || event.target.classList.contains('imageViewerCanvas')) onClose()
  }

  function handleKey(event) {
    if (event.key === 'Tab') {
      const controls = dialogRef.current.querySelectorAll('button:not(:disabled), a[href]')
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomTo(zoom * 1.5) }
    if (event.key === '-') { event.preventDefault(); zoomTo(zoom / 1.5) }
    if (event.key === '0') { event.preventDefault(); setZoom(1) }
  }

  return (
    <dialog className="imageViewer" ref={dialogRef} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); onClose() }} onKeyDown={handleKey}>
      <header className="imageViewerToolbar">
        <span className="imageViewerTitle" id={titleId}>{image.alt}</span>
        <div className="imageViewerControls">
          <button type="button" onClick={() => zoomTo(zoom / 1.5)} disabled={!fit || zoom <= 1} aria-label="Zoom out">−</button>
          <output aria-label="Image scale">{natural && fit ? `${Math.round(width / natural.width * 100)}%` : '…'}</output>
          <button type="button" onClick={() => zoomTo(zoom * 1.5)} disabled={!fit || zoom >= maxZoom} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => setZoom(1)} disabled={!fit}>Fit</button>
          <button type="button" onClick={() => zoomTo(natural.width / fit)} disabled={!fit}>100%</button>
          <button type="button" className="imageViewerClose" onClick={onClose} aria-label="Close image viewer" autoFocus>✕</button>
        </div>
      </header>
      <div ref={stageRef} className={`imageViewerStage${canPan ? ' imageViewerPannable' : ''}`} onPointerDown={startPan} onPointerMove={movePan} onPointerUp={stopPan} onPointerCancel={stopPan} onClick={handleStageClick}>
        <div className="imageViewerCanvas" style={{ width: Math.max(area.width, width + 32), height: Math.max(area.height, height + 32) }}>
          {!natural && !failed && <p role="status">Loading image…</p>}
          {failed ? <p role="alert">This image could not load. <a href={image.src} target="_blank" rel="noreferrer">Open the image directly</a> or close and try again.</p> : (
            /* Full-size media is loaded only on demand; no thumbnail sizing or crop. */
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.src} alt={image.alt} draggable={false} style={{ width: width || undefined, height: height || undefined, visibility: natural ? 'visible' : 'hidden', position: natural ? undefined : 'absolute' }} onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} onError={() => setFailed(true)} />
          )}
        </div>
      </div>
      <footer className="imageViewerHint">Click image to zoom · Drag or swipe to pan · Esc to close <a href={image.src} target="_blank" rel="noreferrer">Open image ↗</a></footer>
    </dialog>
  )
}
