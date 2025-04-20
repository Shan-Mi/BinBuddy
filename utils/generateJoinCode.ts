export function generateJoinCode() {
  const adjectives = ['oak', 'pine', 'maple', 'birch']
  const number = Math.floor(Math.random() * 90 + 10)
  return `${
    adjectives[Math.floor(Math.random() * adjectives.length)]
  }-${number}`
}
