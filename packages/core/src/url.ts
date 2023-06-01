const isValidURL = (href: string) => {
  try {
    const url = new URL(href)
    return true
  } catch (e) {
    return false
  }
}

export { isValidURL }
