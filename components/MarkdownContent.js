import { useCallback, useEffect, useRef } from 'react'

let mermaidDiagramId = 0

function getMermaidErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to render Mermaid diagram'
}

export default function MarkdownContent({ html }) {
  const contentRef = useRef(null)
  const expandedImageRef = useRef(null)

  const clearExpandedImage = useCallback(() => {
    const currentImage = expandedImageRef.current

    currentImage?.classList.remove('imageZoomExpanded')
    currentImage?.setAttribute('aria-expanded', 'false')
    expandedImageRef.current = null
  }, [])

  const toggleExpandedImage = useCallback((image) => {
    const currentImage = expandedImageRef.current

    if (currentImage === image) {
      clearExpandedImage()

      return
    }

    clearExpandedImage()

    image.classList.add('imageZoomExpanded')
    image.setAttribute('aria-expanded', 'true')
    expandedImageRef.current = image
  }, [clearExpandedImage])

  function getZoomableImage(target) {
    if (!(target instanceof Element)) {
      return null
    }

    const image = target.closest('img[data-image-zoom-ready="true"]')

    if (!image || !contentRef.current?.contains(image)) {
      return null
    }

    return image
  }

  useEffect(() => {
    const container = contentRef.current

    if (!container) {
      return undefined
    }

    const codeBlocks = Array.from(
      container.querySelectorAll('pre > code.language-mermaid, pre > code.lang-mermaid')
    )

    if (codeBlocks.length === 0) {
      return undefined
    }

    let cancelled = false

    async function renderMermaidDiagrams() {
      const { default: mermaid } = await import('mermaid')

      mermaid.initialize({
        securityLevel: 'strict',
        startOnLoad: false,
        theme: 'default',
      })

      for (const codeBlock of codeBlocks) {
        if (cancelled) {
          return
        }

        const source = codeBlock.textContent?.trim()
        const pre = codeBlock.parentElement

        if (!source || !pre) {
          continue
        }

        const id = `mermaid-diagram-${Date.now()}-${mermaidDiagramId++}`

        try {
          const { svg, bindFunctions } = await mermaid.render(id, source)

          if (cancelled) {
            return
          }

          const diagram = document.createElement('div')
          diagram.className = 'mermaid-diagram'
          diagram.innerHTML = svg
          pre.replaceWith(diagram)
          bindFunctions?.(diagram)
        } catch (error) {
          pre.classList.add('mermaid-error')
          pre.setAttribute('data-mermaid-error', getMermaidErrorMessage(error))
        }
      }
    }

    renderMermaidDiagrams().catch((error) => {
      if (cancelled) {
        return
      }

      codeBlocks.forEach((codeBlock) => {
        const pre = codeBlock.parentElement

        if (!pre) {
          return
        }

        pre.classList.add('mermaid-error')
        pre.setAttribute('data-mermaid-error', getMermaidErrorMessage(error))
      })
    })

    return () => {
      cancelled = true
    }
  }, [html])

  useEffect(() => {
    function handleDocumentPointerDown(event) {
      const currentImage = expandedImageRef.current

      if (!currentImage) {
        return
      }

      if (event.target instanceof Element && currentImage.contains(event.target)) {
        return
      }

      clearExpandedImage()
    }

    function handleDocumentKeyDown(event) {
      if (event.key === 'Escape') {
        clearExpandedImage()
      }
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)
    document.addEventListener('keydown', handleDocumentKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
      document.removeEventListener('keydown', handleDocumentKeyDown)
    }
  }, [clearExpandedImage])

  useEffect(() => {
    const container = contentRef.current

    clearExpandedImage()

    if (!container) {
      return
    }

    const images = Array.from(container.querySelectorAll('img'))

    images.forEach((image) => {
      if (image.closest('a')) {
        return
      }

      image.classList.add('imageZoomTrigger')
      image.dataset.imageZoomReady = 'true'
      image.decoding = image.decoding || 'async'
      image.loading = image.loading || 'lazy'
      image.tabIndex = 0
      image.setAttribute('role', 'button')
      image.setAttribute('aria-expanded', 'false')
      image.setAttribute(
        'aria-label',
        image.alt ? `Expand image: ${image.alt}` : 'Expand image'
      )
    })
  }, [clearExpandedImage, html])

  function handleContentClick(event) {
    const image = getZoomableImage(event.target)

    if (!image) {
      return
    }

    event.preventDefault()
    toggleExpandedImage(image)
  }

  function handleContentKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    const image = getZoomableImage(event.target)

    if (!image) {
      return
    }

    event.preventDefault()
    toggleExpandedImage(image)
  }

  return (
    <div
      className="markdown-content"
      ref={contentRef}
      onClick={handleContentClick}
      onKeyDown={handleContentKeyDown}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
