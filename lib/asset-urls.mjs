export const DEFAULT_CONTENT_ASSET_DIR = 'content-assets'
export const DEFAULT_CONTENT_ASSET_BUCKET = 'gentrydemchak-portfolio-content'

function trimSlashes(value) {
  return value.replace(/^\/+|\/+$/g, '')
}

function splitReferenceSuffix(reference) {
  const suffixStart = reference.search(/[?#]/)

  if (suffixStart === -1) {
    return {
      path: reference,
      suffix: '',
    }
  }

  return {
    path: reference.slice(0, suffixStart),
    suffix: reference.slice(suffixStart),
  }
}

function encodeAssetPath(assetPath) {
  return assetPath
    .split('/')
    .filter(Boolean)
    .map(encodeURIComponent)
    .join('/')
}

export function getContentAssetBaseUrl({
  baseUrl = process.env.CONTENT_ASSET_BASE_URL || process.env.ASSET_BASE_URL,
  bucket = process.env.CONTENT_ASSET_BUCKET || process.env.ASSET_BUCKET || DEFAULT_CONTENT_ASSET_BUCKET,
} = {}) {
  return (baseUrl || `https://${bucket}.s3.amazonaws.com`).replace(/\/$/, '')
}

export function getContentAssetPath(reference, assetDir = DEFAULT_CONTENT_ASSET_DIR) {
  if (typeof reference !== 'string') {
    return null
  }

  const trimmedReference = reference.trim()

  if (!trimmedReference) {
    return null
  }

  const { path } = splitReferenceSuffix(trimmedReference)
  const normalizedPath = path.replace(/\\/g, '/').replace(/^\.?\//, '')
  const normalizedAssetDir = trimSlashes(assetDir.replace(/\\/g, '/'))
  const assetPrefix = `${normalizedAssetDir}/`

  if (normalizedPath.startsWith(assetPrefix)) {
    return normalizedPath.slice(assetPrefix.length)
  }

  return null
}

export function resolveContentAssetUrl(reference, options = {}) {
  const assetPath = getContentAssetPath(reference, options.assetDir)

  if (!assetPath) {
    return reference
  }

  const { suffix } = splitReferenceSuffix(reference.trim())
  return `${getContentAssetBaseUrl(options)}/${encodeAssetPath(assetPath)}${suffix}`
}

export function resolveContentAssetReferencesInHtml(html, options = {}) {
  if (typeof html !== 'string') {
    return html
  }

  return html.replace(
    /\b(src|poster)=("|')([^"']+)\2/g,
    (match, attribute, quote, value) => {
      const resolvedValue = resolveContentAssetUrl(value, options)

      if (resolvedValue === value) {
        return match
      }

      return `${attribute}=${quote}${resolvedValue}${quote}`
    }
  )
}
