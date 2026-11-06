// Browser regression harness. Run on /posts/politcraft/ at 1440×1000, for example
// with Playwright: await page.evaluate(checkImageViewer). No test-only app hooks.
export default async function checkImageViewer() {
  const assert = (condition, message) => { if (!condition) throw new Error(message) }
  const wait = async (condition) => {
    for (let i = 0; i < 100; i++) {
      if (condition()) return
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    throw new Error('Image viewer did not become ready')
  }
  const trigger = document.querySelector('.markdown-content img[data-image-zoom-ready]')
  assert(trigger, 'Missing inline image trigger')
  trigger.scrollIntoView({ block: 'center' })
  trigger.focus()
  const before = trigger.getBoundingClientRect().width
  const scrollBefore = window.scrollY
  trigger.click()
  await wait(() => document.querySelector('dialog[open] img')?.naturalWidth)
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  const dialog = document.querySelector('dialog[open]')
  const image = dialog.querySelector('img')
  const fitWidth = image.getBoundingClientRect().width
  assert(dialog.clientWidth >= innerWidth - 2, 'Viewer is still constrained to the article')
  if (innerWidth >= 1200) assert(fitWidth > before * 1.6, `Insufficient magnification: ${before} → ${fitWidth}`)
  assert(Math.abs(image.clientWidth / image.clientHeight - image.naturalWidth / image.naturalHeight) < .02, 'Viewer crops or distorts the image')
  dialog.querySelector('[aria-label="Zoom in"]').click()
  await wait(() => image.getBoundingClientRect().width > fitWidth * 1.3)
  const zoomedWidth = image.getBoundingClientRect().width
  Array.from(dialog.querySelectorAll('button')).find(button => button.textContent === '100%').click()
  await wait(() => Math.abs(image.getBoundingClientRect().width - image.naturalWidth) < 2)
  assert(document.body.style.overflow === 'hidden', 'Background page can scroll')
  dialog.querySelector('[aria-label="Close image viewer"]').click()
  await wait(() => !document.querySelector('dialog[open]'))
  assert(document.activeElement === trigger, 'Focus did not return to the image')
  assert(window.scrollY === scrollBefore, 'Closing changed article scroll position')
  assert(document.body.style.overflow !== 'hidden', 'Closing left the page scroll-locked')
  return { before, fitWidth, zoomedWidth, fullWidth: image.naturalWidth, passed: true }
}
