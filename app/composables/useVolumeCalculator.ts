export interface VolumeResult {
  volumeMm3: number
  triangleCount: number
}

export function calculateMeshVolume(vertices: Float32Array, triangleCount: number): VolumeResult {
  let volume = 0
  for (let i = 0; i < triangleCount; i++) {
    const o = i * 9
    const v0x = vertices[o], v0y = vertices[o + 1], v0z = vertices[o + 2]
    const v1x = vertices[o + 3], v1y = vertices[o + 4], v1z = vertices[o + 5]
    const v2x = vertices[o + 6], v2y = vertices[o + 7], v2z = vertices[o + 8]
    volume += (
      v0x * (v1y * v2z - v1z * v2y)
      - v0y * (v1x * v2z - v1z * v2x)
      + v0z * (v1x * v2y - v1y * v2x)
    ) / 6.0
  }
  return { volumeMm3: Math.abs(volume), triangleCount }
}

export function volumeToWeight(volumeMm3: number, densityGPerCm3: number, infillPercent: number): number {
  const volumeCm3 = volumeMm3 / 1000
  return volumeCm3 * densityGPerCm3 * (infillPercent / 100)
}
