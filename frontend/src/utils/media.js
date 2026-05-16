export const avatarUrl = (username = 'User', size = 128) => {
  const safeName = encodeURIComponent(username || 'User')
  return `https://ui-avatars.com/api/?name=${safeName}&background=667eea&color=fff&size=${size}`
}

export const mediaUrl = (value) => {
  if (!value || typeof value !== 'string') return ''
  let trimmed = value.trim()
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return ''
  if (trimmed.startsWith('http://')) trimmed = trimmed.replace('http://', 'https://')
  return trimmed
}

export const avatarSrc = (value, username, size) => mediaUrl(value) || avatarUrl(username, size)

export const useAvatarFallback = (event, username, size) => {
  const fallback = avatarUrl(username, size)
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.src = fallback
  }
}

export const hideBrokenMedia = (event) => {
  event.currentTarget.style.display = 'none'
}
