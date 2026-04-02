<script setup lang="ts">
definePageMeta({ layout: "default" });

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const { data: providers } = await useFetch("/api/auth/providers");

async function login() {
    error.value = "";
    loading.value = true;

    try {
        const result = await authClient.signIn.email({
            email: email.value,
            password: password.value,
        });
        if (result.error) {
            error.value = result.error.message || "Login failed";
        } else {
            await navigateTo("/", { external: true });
        }
    } catch (e: any) {
        error.value = e.message || "Login failed";
    } finally {
        loading.value = false;
    }
}

function loginWithGithub() {
    authClient.signIn.social({ provider: "github" });
}

function loginWithGoogle() {
    authClient.signIn.social({ provider: "google" });
}
</script>

<template>
    <div class="flex min-h-[80vh] items-center justify-center">
        <form
            class="form-panel w-full max-w-sm animate-fade-slide-in border border-border bg-surface p-8"
            @submit.prevent="login"
        >
            <div class="mb-8 text-center">
                <div
                    class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-bg font-mono text-lg font-bold transition-transform duration-500 hover:rotate-[360deg]"
                >
                    YF
                </div>
                <h1 class="text-xl font-semibold tracking-tight">YAFT</h1>
                <p class="mt-1 text-sm text-text-muted">
                    Yet Another Filament Tracker
                </p>
            </div>

            <div
                v-if="error"
                class="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger"
            >
                {{ error }}
            </div>

            <div class="space-y-4">
                <div>
                    <label class="mb-1 block text-sm text-text-muted"
                        >Email</label
                    >
                    <input
                        v-model="email"
                        type="email"
                        required
                        class="w-full"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label class="mb-1 block text-sm text-text-muted"
                        >Password</label
                    >
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
                    class="btn-primary w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
                >
                    {{ loading ? "Logging in..." : "Log in" }}
                </button>
            </div>

            <div v-if="providers?.github || providers?.google" class="mt-6">
                <div class="relative mb-4">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-border" />
                    </div>
                    <div class="relative flex justify-center text-xs">
                        <span class="bg-surface px-2 text-text-dim"
                            >or continue with</span
                        >
                    </div>
                </div>

                <div class="flex gap-3">
                    <button
                        v-if="providers?.github"
                        type="button"
                        class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-text transition-colors hover:bg-surface-hover"
                        @click="loginWithGithub"
                    >
                        GitHub
                    </button>
                    <button
                        v-if="providers?.google"
                        type="button"
                        class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-text transition-colors hover:bg-surface-hover"
                        @click="loginWithGoogle"
                    >
                        Google
                    </button>
                </div>
            </div>

            <p class="mt-6 text-center text-sm text-text-dim">
                Don't have an account?
                <NuxtLink to="/register" class="text-accent hover:underline"
                    >Sign up</NuxtLink
                >
            </p>
        </form>
    </div>
</template>
