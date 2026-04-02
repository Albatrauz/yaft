<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')

const { data: filament } = await useFetch(`/api/filaments/${route.params.id}`)

if (!filament.value) {
  throw createError({ statusCode: 404, message: 'Filament not found' })
}

const form = reactive({
  brand: filament.value.brand,
  type: filament.value.type,
  colorName: filament.value.colorName,
  colorHex: filament.value.colorHex,
  price: filament.value.price,
  purchasedAt: filament.value.purchasedAt,
  weightTotal: filament.value.weightTotal,
  weightRemaining: filament.value.weightRemaining,
  ironingSpeed: filament.value.ironingSpeed ?? 0,
  ironingFlow: filament.value.ironingFlow ?? 0,
  ironingSpacing: filament.value.ironingSpacing ?? 0,
  notes: filament.value.notes ?? '',
})

const commonTypes = ['PLA', 'PLA Matte', 'PLA Silk', 'PETG', 'ABS', 'ABS+', 'TPU', 'ASA', 'Nylon', 'PC']

async function submit() {
  error.value = ''
  loading.value = true

  try {
    await $fetch(`/api/filaments/${route.params.id}`, {
      method: 'PUT',
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
    error.value = e.data?.message || 'Failed to update filament'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <div class="mb-6 flex items-center gap-4">
      <NuxtLink to="/" class="text-text-dim transition-all hover:-translate-x-0.5 hover:text-text">&larr;</NuxtLink>
      <h1 class="text-xl font-bold tracking-tight">Edit Filament</h1>
      <div
        class="h-5 w-5 rounded-full ring-2 ring-white/10 transition-colors"
        :style="{ backgroundColor: form.colorHex }"
      />
    </div>

    <form class="form-panel animate-fade-slide-in border border-border bg-surface p-6" @submit.prevent="submit">
      <div v-if="error" class="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
        {{ error }}
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm text-text-muted">Brand</label>
          <input v-model="form.brand" required class="w-full" />
        </div>

        <div>
          <label class="mb-1 block text-sm text-text-muted">Filament Type</label>
          <input v-model="form.type" required list="filament-types-edit" class="w-full" />
          <datalist id="filament-types-edit">
            <option v-for="t in commonTypes" :key="t" :value="t" />
          </datalist>
        </div>

        <div>
          <label class="mb-1 block text-sm text-text-muted">Color Name</label>
          <input v-model="form.colorName" required class="w-full" />
        </div>

        <div>
          <label class="mb-1 block text-sm text-text-muted">Color</label>
          <div class="flex items-center gap-2">
            <input v-model="form.colorHex" type="color" class="h-[38px] w-12 cursor-pointer rounded-md border-border p-1" />
            <input v-model="form.colorHex" type="text" class="flex-1 font-mono" pattern="^#[0-9a-fA-F]{6}$" />
            <div
              class="h-[38px] w-[38px] shrink-0 rounded-md ring-1 ring-white/10 transition-colors"
              :style="{ backgroundColor: form.colorHex }"
            />
          </div>
        </div>

        <div>
          <label class="mb-1 block text-sm text-text-muted">Price (EUR)</label>
          <input v-model.number="form.price" type="number" step="0.01" min="0" required class="w-full font-mono" />
        </div>

        <div>
          <label class="mb-1 block text-sm text-text-muted">Purchased</label>
          <input v-model="form.purchasedAt" type="date" required class="w-full font-mono" />
        </div>

        <div>
          <label class="mb-1 block text-sm text-text-muted">Total Weight (g)</label>
          <input
            v-model.number="form.weightTotal"
            type="number"
            min="1"
            required
            class="w-full font-mono"
          />
        </div>

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

      <div class="mt-6 border-t border-border/50 pt-4">
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

      <div class="mt-4">
        <label class="mb-1 block text-sm text-text-muted">Notes</label>
        <textarea v-model="form.notes" rows="2" class="w-full" />
      </div>

      <div class="mt-6 flex gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
        >
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
        <NuxtLink
          to="/"
          class="btn-ghost border border-border px-6 py-2.5 text-sm text-text-muted hover:border-border-strong hover:text-text"
        >
          Cancel
        </NuxtLink>
      </div>
    </form>
  </div>
</template>
