<script setup lang="ts">
const { data: filaments, refresh } = await useFetch('/api/filaments')

const search = ref('')
const typeFilter = ref('')

const uniqueTypes = computed(() => {
  if (!filaments.value) return []
  return [...new Set(filaments.value.map((f) => f.type))].sort()
})

const filtered = computed(() => {
  if (!filaments.value) return []
  return filaments.value.filter((f) => {
    const matchesSearch =
      !search.value ||
      f.brand.toLowerCase().includes(search.value.toLowerCase()) ||
      f.colorName.toLowerCase().includes(search.value.toLowerCase()) ||
      f.type.toLowerCase().includes(search.value.toLowerCase())
    const matchesType = !typeFilter.value || f.type === typeFilter.value
    return matchesSearch && matchesType
  })
})

const totalValue = computed(() => {
  if (!filaments.value) return 0
  return filaments.value.reduce((sum, f) => sum + f.price, 0)
})

const totalSpools = computed(() => filaments.value?.length ?? 0)

function remainingPercent(f: { weightRemaining: number; weightTotal: number }) {
  return Math.round((f.weightRemaining / f.weightTotal) * 100)
}

function remainingColor(percent: number) {
  if (percent > 50) return 'bg-success'
  if (percent > 20) return 'bg-warning'
  return 'bg-danger'
}

async function deleteFilament(id: number) {
  if (!confirm('Delete this filament?')) return
  await $fetch(`/api/filaments/${id}`, { method: 'DELETE' })
  refresh()
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Filament Inventory</h1>
        <p class="mt-1 text-sm text-text-muted">
          <span class="font-mono">{{ totalSpools }}</span> spools &middot;
          <span class="font-mono">&euro;{{ totalValue.toFixed(2) }}</span> total value
        </p>
      </div>
      <NuxtLink
        to="/filaments/new"
        class="inline-flex items-center gap-2 bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover"
      >
        <span class="text-lg leading-none">+</span>
        Add Filament
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-3 sm:flex-row">
      <input
        v-model="search"
        type="text"
        placeholder="Search brand, color, type..."
        class="flex-1"
      />
      <select v-model="typeFilter" class="w-full sm:w-48">
        <option value="">All types</option>
        <option v-for="t in uniqueTypes" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="f in filtered"
        :key="f.id"
        class="group border border-border bg-surface transition-colors hover:border-border-strong"
      >
        <!-- Color strip -->
        <div class="h-2" :style="{ backgroundColor: f.colorHex }" />

        <div class="p-4">
          <!-- Top row -->
          <div class="mb-3 flex items-start justify-between">
            <div>
              <h3 class="font-semibold leading-tight">{{ f.colorName }}</h3>
              <p class="text-sm text-text-muted">{{ f.brand }}</p>
            </div>
            <span class="border border-border px-2 py-0.5 text-xs text-text-muted">
              {{ f.type }}
            </span>
          </div>

          <!-- Stats -->
          <div class="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-text-dim">Price</span>
              <p class="font-mono font-medium">&euro;{{ f.price.toFixed(2) }}</p>
            </div>
            <div>
              <span class="text-text-dim">Purchased</span>
              <p class="font-mono font-medium">{{ f.purchasedAt }}</p>
            </div>
          </div>

          <!-- Ironing -->
          <div v-if="f.ironingSpeed" class="mb-3 border-t border-border pt-3">
            <span class="mb-1 block text-xs text-text-dim uppercase tracking-wider">Ironing</span>
            <div class="flex gap-4 text-xs">
              <span class="text-text-muted">
                Speed <span class="font-mono text-text">{{ f.ironingSpeed }}</span> mm/s
              </span>
              <span class="text-text-muted">
                Flow <span class="font-mono text-text">{{ f.ironingFlow }}</span>%
              </span>
              <span class="text-text-muted">
                Gap <span class="font-mono text-text">{{ f.ironingSpacing }}</span> mm
              </span>
            </div>
          </div>

          <!-- Remaining bar -->
          <div class="mb-3">
            <div class="mb-1 flex items-center justify-between text-xs">
              <span class="text-text-dim">Remaining</span>
              <span class="font-mono text-text-muted">
                {{ f.weightRemaining }}g / {{ f.weightTotal }}g
              </span>
            </div>
            <div class="h-1.5 w-full bg-border">
              <div
                class="h-full transition-all"
                :class="remainingColor(remainingPercent(f))"
                :style="{ width: `${remainingPercent(f)}%` }"
              />
            </div>
          </div>

          <!-- Notes -->
          <p v-if="f.notes" class="mb-3 text-xs text-text-dim italic">
            {{ f.notes }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2 border-t border-border pt-3">
            <NuxtLink
              :to="`/filaments/${f.id}`"
              class="flex-1 border border-border py-1.5 text-center text-xs text-text-muted transition-colors hover:border-border-strong hover:text-text"
            >
              Edit
            </NuxtLink>
            <button
              class="border border-border px-3 py-1.5 text-xs text-text-dim transition-colors hover:border-danger hover:text-danger"
              @click="deleteFilament(f.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="border border-border bg-surface p-12 text-center">
      <p class="text-text-muted">No filaments found</p>
      <NuxtLink to="/filaments/new" class="mt-2 inline-block text-sm text-accent hover:text-accent-hover">
        Add your first spool
      </NuxtLink>
    </div>
  </div>
</template>
