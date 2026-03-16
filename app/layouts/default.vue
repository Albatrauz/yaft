<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await clear()
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <header
      v-if="loggedIn"
      class="border-b border-border bg-surface"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center bg-accent text-bg font-mono text-sm font-bold">
            YF
          </div>
          <span class="text-lg font-semibold tracking-tight">YAFT</span>
        </NuxtLink>

        <div class="flex items-center gap-4">
          <span class="text-sm text-text-muted">{{ user?.name }}</span>
          <button
            class="text-sm text-text-dim hover:text-text transition-colors"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8">
      <slot />
    </main>
  </div>
</template>
