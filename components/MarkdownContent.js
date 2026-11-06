import { useEffect, useRef } from 'react'

import { useImageViewer } from './ImageViewer'

let mermaidDiagramId = 0

function getMermaidErrorMessage(error) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unable to render Mermaid diagram'
}

export default function MarkdownContent({ html }) {
  const contentRef = useRef(null)
  const openImage = useImageViewer()

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
    const container = contentRef.current

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
      image.setAttribute('aria-haspopup', 'dialog')
      image.setAttribute(
        'aria-label',
        image.alt ? `Expand image: ${image.alt}` : 'Expand image'
      )
    })
  }, [html])

  function handleContentClick(event) {
    const image = getZoomableImage(event.target)

    if (!image) {
      return
    }

    event.preventDefault()
    openImage({ src: image.currentSrc || image.src, alt: image.alt })
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
    openImage({ src: image.currentSrc || image.src, alt: image.alt })
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
