<script setup lang="ts">
const session = authClient.useSession()
const loggedIn = computed(() => !!session.value.data)
const user = computed(() => session.value.data?.user)

async function logout() {
  await authClient.signOut()
  await navigateTo('/login', { external: true })
}
</script>

<template>
  <div class="min-h-screen bg-bg">
    <header
      v-if="loggedIn"
      class="border-b border-border bg-surface/80 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NuxtLink to="/" class="flex items-center gap-3">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-bg font-mono text-sm font-bold transition-transform duration-500 hover:rotate-[360deg]">
            YF
          </div>
          <span class="text-lg font-semibold tracking-tight">YAFT</span>
        </NuxtLink>

        <nav class="flex items-center gap-6">
          <NuxtLink
            to="/"
            class="text-sm transition-colors"
            :class="$route.path === '/' ? 'text-text border-b-2 border-accent pb-0.5' : 'text-text-muted hover:text-text pb-0.5'"
          >
            Inventory
          </NuxtLink>
          <NuxtLink
            to="/tools/calculator"
            class="text-sm transition-colors"
            :class="$route.path.startsWith('/tools') ? 'text-text border-b-2 border-accent pb-0.5' : 'text-text-muted hover:text-text pb-0.5'"
          >
            Calculator
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs font-medium text-accent">
              {{ user?.name?.charAt(0)?.toUpperCase() }}
            </div>
            <span class="text-sm text-text-muted">{{ user?.name }}</span>
          </div>
          <button
            class="rounded-md px-2.5 py-1 text-sm text-text-dim transition-colors hover:bg-danger/10 hover:text-danger"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8 animate-fade-slide-in">
      <slot />
    </main>
  </div>
</template>
