import '../styles/global.css'
import { ImageViewerProvider } from '../components/ImageViewer'
import XWidgets from '../components/XWidgets'

export default function App({ Component, pageProps }) {
  return (
    <ImageViewerProvider>
      <Component {...pageProps} />
      <XWidgets />
    </ImageViewerProvider>
  )
}
