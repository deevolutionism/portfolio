import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function ExpandableImage({
  alt = '',
  title,
  ...imageProps
}) {
  const containerRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const buttonLabel = alt ? `Expand image: ${alt}` : 'Expand image'

  const toggleExpanded = useCallback(() => {
    setIsExpanded((currentValue) => !currentValue)
  }, [])

  useEffect(() => {
    if (!isExpanded) {
      return undefined
    }

    function handleDocumentPointerDown(event) {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) {
        return
      }

      setIsExpanded(false)
    }

    function handleDocumentKeyDown(event) {
      if (event.key === 'Escape') {
        setIsExpanded(false)
      }
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [isExpanded])

  return (
    <span className="imageZoomFrame" ref={containerRef}>
      <button
        type="button"
        className={`imageZoomButton${isExpanded ? ' imageZoomExpanded' : ''}`}
        onClick={toggleExpanded}
        title={buttonLabel}
        aria-label={buttonLabel}
        aria-expanded={isExpanded}
      >
        <Image {...imageProps} alt={alt} title={title} />
      </button>
    </span>
  )
}
