<script setup lang="ts">
const { data: filaments, refresh } = await useFetch('/api/filaments')

const search = ref('')
const typeFilter = ref('')
const remainingFilter = ref('')
const priceFilter = ref('')

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
    const pct = remainingPercent(f)
    const matchesRemaining =
      !remainingFilter.value ||
      (remainingFilter.value === 'full' && pct > 75) ||
      (remainingFilter.value === 'mid' && pct > 20 && pct <= 75) ||
      (remainingFilter.value === 'low' && pct <= 20) ||
      (remainingFilter.value === 'empty' && pct === 0)
    const matchesPrice =
      !priceFilter.value ||
      (priceFilter.value === 'under15' && f.price < 15) ||
      (priceFilter.value === '15to25' && f.price >= 15 && f.price <= 25) ||
      (priceFilter.value === '25to50' && f.price > 25 && f.price <= 50) ||
      (priceFilter.value === 'over50' && f.price > 50)
    return matchesSearch && matchesType && matchesRemaining && matchesPrice
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
        class="group btn-primary inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover"
      >
        <span class="inline-block text-lg leading-none transition-transform duration-200 group-hover:rotate-90">+</span>
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
      <select v-model="typeFilter" class="w-full sm:w-40">
        <option value="">All types</option>
        <option v-for="t in uniqueTypes" :key="t" :value="t">{{ t }}</option>
      </select>
      <select v-model="remainingFilter" class="w-full sm:w-40">
        <option value="">All levels</option>
        <option value="full">&gt; 75%</option>
        <option value="mid">20 &ndash; 75%</option>
        <option value="low">&le; 20%</option>
        <option value="empty">Empty</option>
      </select>
      <select v-model="priceFilter" class="w-full sm:w-40">
        <option value="">Any price</option>
        <option value="under15">Under &euro;15</option>
        <option value="15to25">&euro;15 &ndash; &euro;25</option>
        <option value="25to50">&euro;25 &ndash; &euro;50</option>
        <option value="over50">Over &euro;50</option>
      </select>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="(f, index) in filtered"
        :key="f.id"
        class="card group animate-card-enter relative overflow-hidden border border-border bg-surface"
        :style="{ animationDelay: `${index * 60}ms` }"
      >
        <!-- Diagonal gradient overlay -->
        <div
          class="pointer-events-none absolute inset-0 opacity-[0.08] transition-opacity duration-300 group-hover:opacity-[0.14]"
          :style="{
            background: `linear-gradient(135deg, ${f.colorHex} 0%, transparent 60%)`
          }"
        />

        <div class="relative p-5">
          <!-- Top row -->
          <div class="mb-3 flex items-start justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-125"
                :style="{ backgroundColor: f.colorHex }"
              />
              <div>
                <h3 class="font-semibold leading-tight">{{ f.colorName }}</h3>
                <p class="text-sm text-text-muted">{{ f.brand }}</p>
              </div>
            </div>
            <span class="rounded-md border border-border bg-bg/50 px-2 py-0.5 text-xs font-medium text-text-muted">
              {{ f.type }}
            </span>
          </div>

          <!-- Stats -->
          <div class="mb-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-xs text-text-dim">Price</span>
              <p class="font-mono font-medium">&euro;{{ f.price.toFixed(2) }}</p>
            </div>
            <div>
              <span class="text-xs text-text-dim">Purchased</span>
              <p class="font-mono font-medium">{{ f.purchasedAt }}</p>
            </div>
          </div>

          <!-- Ironing -->
          <div v-if="f.ironingSpeed" class="mb-3 border-t border-border/50 pt-3">
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
            <div class="mb-1.5 flex items-center justify-between text-xs">
              <span class="text-text-dim">Remaining</span>
              <span class="font-mono text-text-muted">
                {{ f.weightRemaining }}g / {{ f.weightTotal }}g
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-border/50">
              <div
                class="h-full rounded-full animate-bar-fill transition-all"
                :class="[
                  remainingColor(remainingPercent(f)),
                  remainingPercent(f) <= 20 ? 'animate-pulse-warn' : ''
                ]"
                :style="{ width: `${remainingPercent(f)}%` }"
              />
            </div>
          </div>

          <!-- Notes -->
          <p v-if="f.notes" class="mb-3 rounded-md bg-bg/30 px-2.5 py-1.5 text-xs text-text-dim italic">
            {{ f.notes }}
          </p>

          <!-- Actions -->
          <div class="flex gap-2 border-t border-border/50 pt-3">
            <NuxtLink
              :to="`/filaments/${f.id}`"
              class="btn-ghost flex-1 border border-border py-1.5 text-center text-xs text-text-muted hover:border-border-strong hover:text-text"
            >
              Edit
            </NuxtLink>
            <button
              class="btn-ghost border border-border px-3 py-1.5 text-xs text-text-dim hover:border-danger hover:text-danger"
              @click="deleteFilament(f.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="rounded-xl border-2 border-dashed border-border bg-surface/50 p-12 text-center">
      <p class="text-text-muted">No filaments found</p>
      <NuxtLink to="/filaments/new" class="mt-2 inline-block text-sm text-accent hover:text-accent-hover">
        Add your first spool
      </NuxtLink>
    </div>
  </div>
</template>
