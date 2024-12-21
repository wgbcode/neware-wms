<template>
  <div class="c-h100p c-flex-column c-overflow-hidden">
    <Header v-if="!appStore.isOnlyShowMain" class="header c-h45" />
    <section class="c-flex-1 c-flex">
      <Aside
        v-if="!appStore.isOnlyShowMain"
        class="aside c-w180"
        v-show="layoutStore.isShowAside"
      />
      <Main class="c-flex-1 c-relative" />
    </section>
  </div>
</template>

<script setup lang="ts">
import Header from './Header.vue'
import Aside from './Aside.vue'
import Main from './Main.vue'
import { layoutStore } from '@/stores/layout'
import { appStore } from '@/stores/app'
</script>

<style scoped lang="scss">
.header {
  background-color: var(--tc-navbar-topbar);
}

.aside {
  background-color: var(--tc-navbar-topbar);
  border-right: 1px solid var(--tc-navbar-border);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  // @media (max-width: 767px) {
  //   display: none;
  // }
}
</style>
