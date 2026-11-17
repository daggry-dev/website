<script setup lang="ts">
import { ref } from 'vue'

// Set this to the signup backend URL (accepts a POST with JSON { email }).
// While it is empty the form does not send anything and says signups open soon.
const SIGNUP_URL = ''

const email = ref('')
const state = ref<'idle' | 'sending' | 'done' | 'soon' | 'error'>('idle')

async function submit() {
  if (!SIGNUP_URL) { state.value = 'soon'; return }
  state.value = 'sending'
  try {
    const r = await fetch(SIGNUP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value }),
    })
    state.value = r.ok ? 'done' : 'error'
  } catch {
    state.value = 'error'
  }
}
</script>

<template>
  <section id="signup" class="signup" aria-labelledby="signup-h">
    <div class="inner">
      <p class="eyebrow">Private preview</p>
      <h2 id="signup-h">Be there when the <em>public beta</em> opens.</h2>
      <p class="sub">Daggry is in private preview. Leave your email and we will write once, when the public beta is published. Nothing else.</p>
      <form v-if="state !== 'done' && state !== 'soon'" class="form" @submit.prevent="submit">
        <label class="sr" for="signup-email">Email address</label>
        <input id="signup-email" v-model="email" type="email" required autocomplete="email" placeholder="you@company.com" />
        <button type="submit" :disabled="state === 'sending'">{{ state === 'sending' ? 'Sending…' : 'Notify me' }}</button>
      </form>
      <p v-if="state === 'done'" class="msg" role="status">Thank you. We will write when the public beta is published.</p>
      <p v-else-if="state === 'soon'" class="msg" role="status">Signups are not open yet. Please check back soon.</p>
      <p v-else-if="state === 'error'" class="msg err" role="alert">Something went wrong. Please try again in a moment.</p>
    </div>
  </section>
</template>

<style scoped>
.signup {
  margin: 0 0 40px; padding: clamp(40px, 7vw, 80px) clamp(22px, 5vw, 64px); border-radius: 32px;
  border: 1px solid var(--dg-warm-stroke); text-align: center; scroll-margin-top: 90px;
  background: linear-gradient(135deg, var(--dg-warm-fill), var(--dg-rose-fill) 55%, var(--dg-cool-fill));
}
.inner { max-width: 640px; margin: 0 auto; }
.eyebrow { font-size: .78rem; letter-spacing: .18em; text-transform: uppercase; color: var(--dg-muted); margin: 0 0 18px; }
h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(2rem, 4.6vw, 3.4rem); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 18px; border: 0; padding: 0; color: var(--dg-ink); }
h2 em { font-style: italic; background: var(--dg-grad-text); -webkit-background-clip: text; background-clip: text; color: transparent; padding-right: .06em; }
.sub { color: var(--dg-muted); line-height: 1.7; font-size: 1.05rem; margin: 0 0 30px; }
.form { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
input {
  flex: 1 1 280px; min-width: 0; min-height: 52px; padding: 0 20px; border-radius: 999px; font: inherit; font-size: 1rem;
  border: 1px solid var(--dg-btn-border); background: var(--dg-surface); color: var(--dg-ink);
}
input:focus-visible, button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
button {
  min-height: 52px; padding: 0 30px; border-radius: 999px; font: inherit; font-weight: 500; cursor: pointer;
  border: 1px solid var(--dg-btn-primary-bg); background: var(--dg-btn-primary-bg); color: var(--dg-btn-primary-fg);
}
button:disabled { opacity: .6; cursor: default; }
.msg { margin: 0; font-size: 1.05rem; color: var(--dg-ink); }
.err { color: var(--vp-c-danger-1); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
