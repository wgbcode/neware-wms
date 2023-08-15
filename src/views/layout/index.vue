<template>
  <div class="c-h100p c-flex-column">
    <Header class="header c-h45" />
    <section class="c-flex-1 c-flex">
      <Aside class="aside c-w180" />
      <Main class="main c-flex-1" />
    </section>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Aside from './Aside.vue'
import Main from './Main.vue'
</script>

<style scoped>
.header {
  background-color: var(--tc-navbar-topbar);
}

.aside {
  background-color: var(--tc-navbar-topbar);
  border-right: 1px solid var(--tc-navbar-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  /* @media (max-width: 767px) {
    display: none;
  } */
}

.main {
}
</style>
