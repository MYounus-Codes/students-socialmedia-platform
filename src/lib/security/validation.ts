export function isSafeText(text: string) {
  return !/[<>]/.test(text);
}

export function isValidUsername(username: string) {
  return /^[a-z0-9_\-]{3,24}$/i.test(username);
}
