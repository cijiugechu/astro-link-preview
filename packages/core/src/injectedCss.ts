const injectedCss = `
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

export { injectedCss }
