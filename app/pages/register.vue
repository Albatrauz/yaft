<script setup lang="ts">
definePageMeta({ layout: 'default' })

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

const { data: providers } = await useFetch('/api/auth/providers')

async function register() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true

  try {
    const result = await authClient.signUp.email({
      name: name.value,
      email: email.value,
      password: password.value,
    })
    if (result.error) {
      error.value = result.error.message || 'Registration failed'
    } else {
      navigateTo('/')
    }
  } catch (e: any) {
    error.value = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}

function loginWithGithub() {
  authClient.signIn.social({ provider: 'github' })
}

function loginWithGoogle() {
  authClient.signIn.social({ provider: 'google' })
}
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center">
    <form
      class="w-full max-w-sm border border-border bg-surface p-8"
      @submit.prevent="register"
    >
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center bg-accent text-bg font-mono text-lg font-bold">
          YF
        </div>
        <h1 class="text-xl font-semibold tracking-tight">Create account</h1>
        <p class="mt-1 text-sm text-text-muted">Start tracking your filaments</p>
      </div>

      <div v-if="error" class="mb-4 border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="mb-1 block text-sm text-text-muted">Name</label>
          <input
            v-model="name"
            type="text"
            required
            class="w-full"
            placeholder="Your name"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-text-muted">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-text-muted">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="8"
            class="w-full"
            placeholder="min. 8 characters"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-text-muted">Confirm password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            minlength="8"
            class="w-full"
            placeholder="repeat password"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-accent py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {{ loading ? 'Creating account...' : 'Sign up' }}
        </button>
      </div>

      <div v-if="providers?.github || providers?.google" class="mt-6">
        <div class="relative mb-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-border" />
          </div>
          <div class="relative flex justify-center text-xs">
            <span class="bg-surface px-2 text-text-dim">or continue with</span>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            v-if="providers?.github"
            type="button"
            class="flex flex-1 items-center justify-center gap-2 border border-border py-2.5 text-sm text-text transition-colors hover:bg-bg"
            @click="loginWithGithub"
          >
            GitHub
          </button>
          <button
            v-if="providers?.google"
            type="button"
            class="flex flex-1 items-center justify-center gap-2 border border-border py-2.5 text-sm text-text transition-colors hover:bg-bg"
            @click="loginWithGoogle"
          >
            Google
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-text-dim">
        Already have an account?
        <NuxtLink to="/login" class="text-accent hover:underline">Log in</NuxtLink>
      </p>
    </form>
  </div>
</template>
