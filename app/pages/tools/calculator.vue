<script setup lang="ts">
import { parseStl, type ParsedMesh } from '~/composables/useStlParser'
import { parse3mf } from '~/composables/use3mfParser'
import { calculateMeshVolume, volumeToWeight } from '~/composables/useVolumeCalculator'
import { MATERIAL_DENSITIES, getDensityForType } from '~/composables/useMaterialDensities'

const { data: filaments } = await useFetch('/api/filaments')

const file = ref<File | null>(null)
const parsing = ref(false)
const parseError = ref('')
const mesh = ref<ParsedMesh | null>(null)
const dragging = ref(false)

const infill = ref(20)
const materialMode = ref<'type' | 'spool'>('type')
const selectedType = ref('PLA')
const selectedSpoolId = ref<number | null>(null)

const fileInputRef = ref<HTMLInputElement | null>(null)

const density = computed(() => {
  if (materialMode.value === 'spool' && selectedSpoolId.value) {
    const spool = filaments.value?.find(f => f.id === selectedSpoolId.value)
    if (spool) return getDensityForType(spool.type) ?? 1.24
  }
  return MATERIAL_DENSITIES[selectedType.value] ?? 1.24
})

const selectedSpool = computed(() => {
  if (materialMode.value !== 'spool' || !selectedSpoolId.value) return null
  return filaments.value?.find(f => f.id === selectedSpoolId.value) ?? null
})

const result = computed(() => {
  if (!mesh.value) return null
  const vol = calculateMeshVolume(mesh.value.vertices, mesh.value.triangleCount)
  const weight = volumeToWeight(vol.volumeMm3, density.value, infill.value)
  return { ...vol, weight, volumeCm3: vol.volumeMm3 / 1000 }
})

const spoolComparison = computed(() => {
  if (!result.value || !selectedSpool.value) return null
  const remaining = selectedSpool.value.weightRemaining
  const percent = Math.round((result.value.weight / remaining) * 100)
  return { remaining, percent, enough: result.value.weight <= remaining }
})

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

async function handleFile(f: File) {
  const ext = f.name.split('.').pop()?.toLowerCase()
  if (ext !== 'stl' && ext !== '3mf') {
    parseError.value = 'Unsupported file type. Please use .stl or .3mf files.'
    return
  }

  file.value = f
  parsing.value = true
  parseError.value = ''
  mesh.value = null

  try {
    const buffer = await f.arrayBuffer()
    if (ext === 'stl') {
      mesh.value = parseStl(buffer)
    } else {
      mesh.value = await parse3mf(buffer)
    }
  } catch (e: any) {
    parseError.value = e.message || 'Failed to parse file'
  } finally {
    parsing.value = false
  }
}

function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files[0]
  if (f) handleFile(f)
}

function onFileInput(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) handleFile(f)
}

function clearFile() {
  file.value = null
  mesh.value = null
  parseError.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function remainingPercent(spool: { weightRemaining: number; weightTotal: number }) {
  return Math.round((spool.weightRemaining / spool.weightTotal) * 100)
}

function remainingColor(percent: number) {
  if (percent > 50) return 'bg-success'
  if (percent > 20) return 'bg-warning'
  return 'bg-danger'
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <!-- Header -->
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/" class="text-text-dim hover:text-text transition-colors">&larr;</NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">Filament Calculator</h1>
    </div>

    <!-- Drop Zone -->
    <div
      v-if="!file"
      class="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed p-12 transition-colors"
      :class="dragging ? 'border-accent bg-accent/5' : 'border-border bg-surface'"
      @dragover.prevent="dragging = true"
      @dragenter.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
      @click="fileInputRef?.click()"
    >
      <svg class="mb-4 h-10 w-10 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p class="text-sm text-text-muted">Drop <span class="font-mono text-text">.stl</span> or <span class="font-mono text-text">.3mf</span> file here</p>
      <p class="mt-1 text-xs text-text-dim">or click to browse</p>
      <input
        ref="fileInputRef"
        type="file"
        accept=".stl,.3mf"
        class="hidden"
        @change="onFileInput"
      />
    </div>

    <!-- File Loaded Bar -->
    <div v-else class="flex items-center justify-between border border-border bg-surface px-4 py-3">
      <div class="flex items-center gap-3">
        <svg class="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div>
          <p class="text-sm font-medium">{{ file.name }}</p>
          <p class="font-mono text-xs text-text-dim">{{ formatFileSize(file.size) }}</p>
        </div>
      </div>
      <button
        class="text-text-dim hover:text-text transition-colors"
        @click="clearFile"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Parsing State -->
    <div v-if="parsing" class="mt-4 border border-border bg-surface px-4 py-3 text-sm text-text-muted">
      Parsing...
    </div>

    <!-- Parse Error -->
    <div v-if="parseError" class="mt-4 border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      {{ parseError }}
    </div>

    <!-- Settings + Results -->
    <template v-if="mesh && !parsing">
      <!-- Settings Panel -->
      <div class="mt-4 border border-border bg-surface p-6">
        <h2 class="mb-4 text-sm font-semibold uppercase tracking-wider text-text-dim">Settings</h2>

        <div class="grid gap-6 sm:grid-cols-2">
          <!-- Infill -->
          <div>
            <label class="mb-1 block text-sm text-text-muted">Infill</label>
            <div class="flex items-center gap-3">
              <input
                v-model.number="infill"
                type="range"
                min="0"
                max="100"
                step="5"
                class="h-1.5 flex-1 cursor-pointer appearance-none bg-border accent-accent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent"
              />
              <span class="w-12 text-right font-mono text-sm text-text">{{ infill }}%</span>
            </div>
          </div>

          <!-- Material -->
          <div>
            <label class="mb-1 block text-sm text-text-muted">Material</label>
            <!-- Mode toggle -->
            <div class="mb-2 flex">
              <button
                class="flex-1 py-1.5 text-xs font-medium transition-colors"
                :class="materialMode === 'type' ? 'bg-accent text-bg' : 'border border-border text-text-muted hover:text-text'"
                @click="materialMode = 'type'"
              >
                Type
              </button>
              <button
                class="flex-1 py-1.5 text-xs font-medium transition-colors"
                :class="materialMode === 'spool' ? 'bg-accent text-bg' : 'border border-border text-text-muted hover:text-text'"
                @click="materialMode = 'spool'"
              >
                My Spools
              </button>
            </div>

            <!-- Material type dropdown -->
            <select
              v-if="materialMode === 'type'"
              v-model="selectedType"
              class="w-full"
            >
              <option v-for="(d, name) in MATERIAL_DENSITIES" :key="name" :value="name">
                {{ name }} ({{ d }} g/cm³)
              </option>
            </select>

            <!-- Spool dropdown -->
            <select
              v-else
              v-model="selectedSpoolId"
              class="w-full"
            >
              <option :value="null" disabled>Select a spool...</option>
              <option
                v-for="f in filaments"
                :key="f.id"
                :value="f.id"
              >
                {{ f.brand }} — {{ f.colorName }} ({{ f.type }}, {{ f.weightRemaining }}g left)
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="mt-4 border border-border bg-surface p-6">
        <div class="mb-4 flex items-baseline justify-between text-sm">
          <span class="text-text-dim">Triangles</span>
          <span class="font-mono text-text-muted">{{ result?.triangleCount.toLocaleString() }}</span>
        </div>

        <div class="mb-4 flex items-baseline justify-between text-sm">
          <span class="text-text-dim">Volume</span>
          <span class="font-mono text-text-muted">{{ result?.volumeCm3.toFixed(2) }} cm³</span>
        </div>

        <div class="flex items-baseline justify-between">
          <span class="text-sm text-text-dim">Estimated weight</span>
          <span class="text-3xl font-mono font-bold text-accent">{{ result?.weight.toFixed(1) }}g</span>
        </div>

        <!-- Spool comparison -->
        <div v-if="spoolComparison && selectedSpool" class="mt-4 border-t border-border pt-4">
          <div class="mb-2 flex items-center justify-between text-sm">
            <span class="text-text-muted">
              <span :style="{ color: selectedSpool.colorHex }">&bull;</span>
              {{ selectedSpool.brand }} {{ selectedSpool.colorName }}
            </span>
            <span class="font-mono text-text-muted">
              {{ result?.weight.toFixed(1) }}g of {{ spoolComparison.remaining }}g
              <span :class="spoolComparison.enough ? 'text-success' : 'text-danger'">
                ({{ spoolComparison.percent }}%)
              </span>
            </span>
          </div>
          <div class="h-1.5 w-full bg-border">
            <div
              class="h-full transition-all"
              :class="remainingColor(remainingPercent(selectedSpool))"
              :style="{ width: `${remainingPercent(selectedSpool)}%` }"
            />
          </div>
          <p v-if="!spoolComparison.enough" class="mt-2 text-xs text-danger">
            Not enough filament remaining on this spool
          </p>
        </div>
      </div>
    </template>

    <!-- Disclaimer -->
    <p class="mt-4 text-xs text-text-dim">
      Estimate based on mesh volume and infill density. Actual usage varies with slicer settings, supports, and print parameters.
    </p>
  </div>
</template>
