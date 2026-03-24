import { unzipSync } from 'fflate'
import type { ParsedMesh } from './useStlParser'

const MODEL_NS = 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'
const RELS_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'

export async function parse3mf(buffer: ArrayBuffer): Promise<ParsedMesh> {
  const files = unzipSync(new Uint8Array(buffer))

  const modelPath = findModelPathFromRels(files) ?? findModelPathByExtension(files)

  if (!modelPath) {
    throw new Error('No 3D model found in 3MF archive')
  }

  const xml = new TextDecoder().decode(files[modelPath])
  const doc = new DOMParser().parseFromString(xml, 'text/xml')

  const allVertices: number[] = []

  // getElementsByTagNameNS handles the 3MF XML namespace correctly;
  // querySelectorAll does not match elements in a declared namespace.
  const meshes = doc.getElementsByTagNameNS(MODEL_NS, 'mesh')

  if (meshes.length === 0) {
    throw new Error('No mesh data found in 3MF file')
  }

  for (const mesh of meshes) {
    const vertexElements = mesh.getElementsByTagNameNS(MODEL_NS, 'vertex')
    const verts: number[][] = []
    for (const v of vertexElements) {
      verts.push([
        parseFloat(v.getAttribute('x') || '0'),
        parseFloat(v.getAttribute('y') || '0'),
        parseFloat(v.getAttribute('z') || '0'),
      ])
    }

    const triangleElements = mesh.getElementsByTagNameNS(MODEL_NS, 'triangle')
    for (const t of triangleElements) {
      const v1 = parseInt(t.getAttribute('v1') || '0')
      const v2 = parseInt(t.getAttribute('v2') || '0')
      const v3 = parseInt(t.getAttribute('v3') || '0')
      if (verts[v1] && verts[v2] && verts[v3]) {
        allVertices.push(...verts[v1], ...verts[v2], ...verts[v3])
      }
    }
  }

  const triangleCount = allVertices.length / 9
  if (triangleCount === 0) {
    throw new Error('No mesh data found in 3MF file')
  }

  return { vertices: new Float32Array(allVertices), triangleCount }
}

function findModelPathFromRels(files: Record<string, Uint8Array>): string | null {
  const relsFile = files['_rels/.rels']
  if (!relsFile) return null

  const xml = new TextDecoder().decode(relsFile)
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const rels = doc.getElementsByTagNameNS(RELS_NS, 'Relationship')

  for (const rel of rels) {
    const type = rel.getAttribute('Type')
    if (type?.includes('3dmodel')) {
      const target = rel.getAttribute('Target')
      if (target) {
        // Target may have a leading slash — strip it to match ZIP entry keys
        return target.replace(/^\//, '')
      }
    }
  }

  return null
}

function findModelPathByExtension(files: Record<string, Uint8Array>): string | null {
  const keys = Object.keys(files)
  return keys.find(k => k.toLowerCase().endsWith('.model') && k.toLowerCase().includes('3d/'))
    ?? keys.find(k => k.toLowerCase().endsWith('.model'))
    ?? null
}
