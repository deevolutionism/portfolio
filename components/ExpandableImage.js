import Image from 'next/image'
import { useImageViewer } from './ImageViewer'

export default function ExpandableImage({ alt = '', title, ...imageProps }) {
  const openImage = useImageViewer()
  const buttonLabel = alt ? `Expand image: ${alt}` : 'Expand image'

  return (
    <span className="imageZoomFrame">
      <button type="button" className="imageZoomButton" onClick={(event) => openImage({ src: event.currentTarget.querySelector('img').currentSrc, alt })} title={buttonLabel} aria-label={buttonLabel} aria-haspopup="dialog">
        <Image {...imageProps} alt={alt} title={title} />
      </button>
    </span>
  )
}
