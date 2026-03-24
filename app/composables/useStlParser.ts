export interface ParsedMesh {
  vertices: Float32Array
  triangleCount: number
}

export function parseStl(buffer: ArrayBuffer): ParsedMesh {
  const isBinary = checkBinary(buffer)
  return isBinary ? parseBinaryStl(buffer) : parseAsciiStl(buffer)
}

function checkBinary(buffer: ArrayBuffer): boolean {
  // Binary STL: 80-byte header + 4-byte count + n * 50 bytes
  if (buffer.byteLength < 84) return false
  const view = new DataView(buffer)
  const triangleCount = view.getUint32(80, true)
  const expectedSize = 84 + triangleCount * 50
  // If size matches binary format, treat as binary (even if header starts with "solid")
  if (buffer.byteLength === expectedSize) return true
  // If it starts with "solid" and size doesn't match binary, it's ASCII
  const header = new Uint8Array(buffer, 0, 5)
  const startsWithSolid = String.fromCharCode(...header) === 'solid'
  return !startsWithSolid
}

function parseBinaryStl(buffer: ArrayBuffer): ParsedMesh {
  const view = new DataView(buffer)
  const triangleCount = view.getUint32(80, true)

  if (triangleCount === 0) {
    throw new Error('File contains no geometry')
  }

  const vertices = new Float32Array(triangleCount * 9)
  let offset = 84

  for (let i = 0; i < triangleCount; i++) {
    // Skip normal vector (12 bytes)
    offset += 12
    // Read 3 vertices (each 3 × float32 = 12 bytes)
    for (let v = 0; v < 9; v++) {
      vertices[i * 9 + v] = view.getFloat32(offset, true)
      offset += 4
    }
    // Skip attribute byte count (2 bytes)
    offset += 2
  }

  return { vertices, triangleCount }
}

function parseAsciiStl(buffer: ArrayBuffer): ParsedMesh {
  const text = new TextDecoder().decode(buffer)
  const vertexRegex = /vertex\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)/g
  const coords: number[] = []
  let match: RegExpExecArray | null

  while ((match = vertexRegex.exec(text)) !== null) {
    coords.push(parseFloat(match[1]!), parseFloat(match[2]!), parseFloat(match[3]!))
  }

  const triangleCount = coords.length / 9
  if (triangleCount === 0) {
    throw new Error('File contains no geometry')
  }

  return { vertices: new Float32Array(coords), triangleCount }
}
