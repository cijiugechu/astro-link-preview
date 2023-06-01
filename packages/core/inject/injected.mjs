const cssCode = `
.astro-link-preview_img {
  opacity: 0;
  height: 0;
  transform: translate(-50%, 1rem);
  animation-name: astro-link-preview-animation;
  animation-duration: 300ms;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
  animation-delay: 0ms;
  animation-iteration-count: 1;
}

.astro-link-preview_img--hidden {
  animation-name: astro-link-preview--hidden-animation;
  animation-duration: 300ms;
  animation-fill-mode: forwards;
  animation-timing-function: ease-in-out;
  animation-delay: 0ms;
  animation-iteration-count: 1;
}

@keyframes astro-link-preview-animation {
  from {
    opacity: 0;
    height: 0;
  }

  to {
    opacity: 1;
    height: 200px;
  }
}

@keyframes astro-link-preview--hidden-animation {
  from {
    opacity: 1;
    height: 200px;
  }

  to {
    opacity: 0;
    height: 0;
  }
}
`

try {
  if (typeof document != 'undefined') {
    var elementStyle = document.createElement('style')
    elementStyle.appendChild(document.createTextNode(cssCode))
    document.head.appendChild(elementStyle)
  }
} catch (e) {
  console.error('vite-plugin-css-injected-by-js', e)
}

const hostname = window.location.hostname

const isExternalURL = hn => {
  return hn !== hostname
}

const anchorElements = document.querySelectorAll('a')

const links = Array.from(anchorElements).filter(
  node => node.href && isExternalURL(node.hostname)
)

links.forEach(item => {
  const hashed = (() => {
    if (import.meta.env.PROD) {
      return item.dataset['linkPreview']
    }

    return item.href
  })()

  item.addEventListener('mouseenter', e => {
    const href = item.href

    let previewElement = null

    const el = document.getElementById(`image-${hashed}`)

    if (el) {
      previewElement = el
      el.classList.remove('astro-link-preview_img--hidden')
    } else {
      previewElement = document.createElement('img')

      if (import.meta.env.PROD) {
        previewElement.src = `${import.meta.env.BASE_URL}${hashed}.png`
      }

      previewElement.className = 'astro-link-preview_img'
      previewElement.id = `image-${hashed}`
      previewElement.style.position = 'fixed'

      previewElement.style.left = `${e.clientX}px`

      previewElement.style.top = `${e.clientY}px`
    }

    document.body.appendChild(previewElement)

    if (!import.meta.env.PROD) {
      fetch(`/_astro-link-preview/${window.btoa(href)}`)
        .then(r => {
          if (r.ok) {
            return r.blob()
          } else {
            return null
          }
        })
        .then(blob => {
          if (blob) {
            previewElement.src = URL.createObjectURL(blob)
          }
        })
    }
  })

  item.addEventListener('mouseleave', e => {
    const previewElement = document.getElementById(`image-${hashed}`)

    previewElement.classList.add('astro-link-preview_img--hidden')
  })
})

export {}
