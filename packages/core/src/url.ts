const isValidURL = (href: string) => {
  try {
    const url = new URL(href)
    return ['http:', 'https:'].includes(url.protocol)
  } catch (e) {
    return false
  }
}

export { isValidURL }
