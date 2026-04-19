import '../styles/global.css'
import XWidgets from '../components/XWidgets'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <XWidgets />
    </>
  )
}
