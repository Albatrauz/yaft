export const MATERIAL_DENSITIES: Record<string, number> = {
  'PLA': 1.24,
  'PLA Matte': 1.24,
  'PLA Silk': 1.24,
  'PETG': 1.27,
  'ABS': 1.04,
  'ABS+': 1.07,
  'ASA': 1.07,
  'TPU': 1.21,
  'Nylon': 1.14,
  'PC': 1.20,
}

export function getDensityForType(type: string): number | undefined {
  return MATERIAL_DENSITIES[type]
    ?? Object.entries(MATERIAL_DENSITIES)
        .find(([k]) => k.toLowerCase() === type.toLowerCase())?.[1]
    ?? Object.entries(MATERIAL_DENSITIES)
        .find(([k]) => type.toLowerCase().startsWith(k.toLowerCase()))?.[1]
}
