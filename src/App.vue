<template>
  <div class="wrapper">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { pinia } from '@/stores/auth'
import { cloneDeep } from 'lodash-es'
import { reactive } from 'vue'

// pinia 数据持久化
const localStore = sessionStorage.getItem('VU3PINIASTATE')
localStore && (pinia.state.value = reactive(JSON.parse(localStore)))
window.addEventListener('beforeunload', () => {
  const state = cloneDeep(pinia.state)
  sessionStorage.setItem('VU3PINIASTATE', JSON.stringify(state))
})
</script>

<style scoped lang="scss">
.wrapper {
  height: 100%;
}
</style>
