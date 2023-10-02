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
const isProd = import.meta.env.PROD
const isSsr = false
const isSsrOrDev = !isProd || isSsr
const enableOnMobile = false

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

const isHttpAddress = address => {
  return address.startsWith('http://') || address.startsWith('https://')
}

const anchorElements = document.querySelectorAll('a')

const links = Array.from(anchorElements).filter(
  node => node.href && isExternalURL(node.hostname) && isHttpAddress(node.href)
)

links.forEach(item => {
  const hashed = (() => {
    if (!isSsrOrDev) {
      return item.dataset['linkPreview']
    }

    return item.href
  })()

  item.addEventListener('mouseenter', e => {
    if (!enableOnMobile && window.innerWidth <= 768) {
      return
    }

    const href = item.href

    let previewElement = null

    const el = document.getElementById(`image-${hashed}`)

    const x = `${e.clientX}px`
    const y =
      e.screenY + 200 >= window.innerHeight
        ? `calc(${e.clientY - 200}px - 2rem )`
        : `${e.clientY}px`

    if (el) {
      previewElement = el
      previewElement.style.left = x
      previewElement.style.top = y
      el.classList.remove('astro-link-preview_img--hidden')
    } else {
      previewElement = document.createElement('img')

      if (!isSsrOrDev) {
        previewElement.src = `${import.meta.env.BASE_URL}${hashed}.png`
      }

      previewElement.className = 'astro-link-preview_img'
      previewElement.id = `image-${hashed}`
      previewElement.style.position = 'fixed'

      previewElement.style.left = x

      previewElement.style.top = y
    }

    document.body.appendChild(previewElement)

    if (isSsrOrDev) {
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
    if (!enableOnMobile && window.innerWidth <= 768) {
      return
    }

    const previewElement = document.getElementById(`image-${hashed}`)

    previewElement.classList.add('astro-link-preview_img--hidden')
  })
})

export {}
