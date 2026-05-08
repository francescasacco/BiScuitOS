export const computeClamp = (
  px: number,
  py: number,
  Z: number,
  cx: number,
  cy: number,
  W: number,
  H: number,
) => {
  if (Z <= 1) return { x: 0, y: 0 }
  const maxRight = Math.max(0, (Z * cx - 50) / 100 * W)
  const maxLeft  = Math.max(0, (Z * (100 - cx) - 50) / 100 * W)
  const maxDown  = Math.max(0, (Z * cy - 50) / 100 * H)
  const maxUp    = Math.max(0, (Z * (100 - cy) - 50) / 100 * H)
  return {
    x: Math.max(-maxLeft, Math.min(maxRight, px)),
    y: Math.max(-maxUp,   Math.min(maxDown,  py)),
  }
}
