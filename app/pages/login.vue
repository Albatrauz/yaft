<script setup lang="ts">
definePageMeta({ layout: 'default' })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await useUserSession().fetch()
    navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center">
    <form
      class="w-full max-w-sm border border-border bg-surface p-8"
      @submit.prevent="login"
    >
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-accent text-bg font-mono text-lg font-bold">
          YF
        </div>
        <h1 class="text-xl font-semibold tracking-tight">YAFT</h1>
        <p class="mt-1 text-sm text-text-muted">Yet Another Filament Tracker</p>
      </div>

      <div v-if="error" class="mb-4 border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm text-text-muted">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full"
            placeholder="admin@yaft.local"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-text-muted">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full"
            placeholder="password"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-accent py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>
      </div>
    </form>
  </div>
</template>
