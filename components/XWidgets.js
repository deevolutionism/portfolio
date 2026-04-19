import Script from 'next/script'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function loadXWidgets() {
  window.twttr?.widgets?.load()
}

export default function XWidgets() {
  const router = useRouter()

  useEffect(() => {
    router.events.on('routeChangeComplete', loadXWidgets)

    return () => {
      router.events.off('routeChangeComplete', loadXWidgets)
    }
  }, [router.events])

  return (
    <Script
      id="x-widgets"
      src="https://platform.twitter.com/widgets.js"
      strategy="lazyOnload"
      onLoad={loadXWidgets}
    />
  )
}
