<template>
  <div class="c-flex-column c-flex-1">
    <TagsView />
    <router-view
      v-if="layoutStore.reloadRouter"
      class="c-absolute c-t28 c-b0 c-l0 c-r0 c-px10 c-py5 c-flex-column"
    >
    </router-view>
  </div>
</template>

<script setup lang="ts">
import TagsView from './TagsView.vue'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
</script>
