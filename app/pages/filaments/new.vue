<script setup lang="ts">
const router = useRouter()
const loading = ref(false)
const error = ref('')

const form = reactive({
  brand: '',
  type: '',
  colorName: '',
  colorHex: '#000000',
  price: 0,
  purchasedAt: new Date().toISOString().split('T')[0],
  weightTotal: 1000,
  weightRemaining: 1000,
  ironingSpeed: 15,
  ironingFlow: 10,
  ironingSpacing: 0.1,
  notes: '',
})

const commonTypes = ['PLA', 'PLA Matte', 'PLA Silk', 'PETG', 'ABS', 'ABS+', 'TPU', 'ASA', 'Nylon', 'PC']

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/filaments', {
      method: 'POST',
      body: {
        ...form,
        notes: form.notes || null,
        ironingSpeed: form.ironingSpeed || null,
        ironingFlow: form.ironingFlow || null,
        ironingSpacing: form.ironingSpacing || null,
      },
    })
    router.push('/')
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to create filament'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/" class="text-text-dim hover:text-text transition-colors">&larr;</NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">Add Filament</h1>
    </div>

    <form class="border border-border bg-surface p-6" @submit.prevent="submit">
      <div v-if="error" class="mb-4 border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
        {{ error }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <!-- Brand -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Brand</label>
          <input v-model="form.brand" required class="w-full" placeholder="Bambu Lab" />
        </div>

        <!-- Type -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Filament Type</label>
          <input
            v-model="form.type"
            required
            list="filament-types"
            class="w-full"
            placeholder="PLA Matte"
          />
          <datalist id="filament-types">
            <option v-for="t in commonTypes" :key="t" :value="t" />
          </datalist>
        </div>

        <!-- Color Name -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Color Name</label>
          <input v-model="form.colorName" required class="w-full" placeholder="Charcoal Black" />
        </div>

        <!-- Color Hex -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Color</label>
          <div class="flex gap-2">
            <input
              v-model="form.colorHex"
              type="color"
              class="h-[38px] w-12 cursor-pointer border-border p-1"
            />
            <input
              v-model="form.colorHex"
              type="text"
              class="flex-1 font-mono"
              placeholder="#000000"
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
        </div>

        <!-- Price -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Price (EUR)</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            min="0"
            required
            class="w-full font-mono"
          />
        </div>

        <!-- Purchased Date -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Purchased</label>
          <input v-model="form.purchasedAt" type="date" required class="w-full font-mono" />
        </div>

        <!-- Weight Total -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Total Weight (g)</label>
          <input
            v-model.number="form.weightTotal"
            type="number"
            min="1"
            required
            class="w-full font-mono"
            @input="form.weightRemaining = Math.min(form.weightRemaining, form.weightTotal)"
          />
        </div>

        <!-- Weight Remaining -->
        <div>
          <label class="mb-1 block text-sm text-text-muted">Remaining (g)</label>
          <input
            v-model.number="form.weightRemaining"
            type="number"
            min="0"
            :max="form.weightTotal"
            required
            class="w-full font-mono"
          />
        </div>
      </div>

      <!-- Ironing section -->
      <div class="mt-6 border-t border-border pt-4">
        <h3 class="mb-3 text-sm font-semibold uppercase tracking-wider text-text-dim">Ironing Settings</h3>
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm text-text-muted">Speed (mm/s)</label>
            <input v-model.number="form.ironingSpeed" type="number" step="0.5" min="0" class="w-full font-mono" />
          </div>
          <div>
            <label class="mb-1 block text-sm text-text-muted">Flow (%)</label>
            <input v-model.number="form.ironingFlow" type="number" step="0.5" min="0" class="w-full font-mono" />
          </div>
          <div>
            <label class="mb-1 block text-sm text-text-muted">Spacing (mm)</label>
            <input v-model.number="form.ironingSpacing" type="number" step="0.01" min="0" class="w-full font-mono" />
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="mt-4">
        <label class="mb-1 block text-sm text-text-muted">Notes</label>
        <textarea v-model="form.notes" rows="2" class="w-full" placeholder="Optional notes..." />
      </div>

      <!-- Submit -->
      <div class="mt-6 flex gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : 'Add Filament' }}
        </button>
        <NuxtLink
          to="/"
          class="border border-border px-6 py-2.5 text-sm text-text-muted transition-colors hover:border-border-strong hover:text-text"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
