<template>
  <div class="c-flex-column c-flex-1">
    <TagsView />
    <router-view v-if="layoutStore.reloadRouter"> </router-view>
  </div>
</template>

<script setup lang="ts">
import TagsView from './TagsView.vue'
import { useLayoutStore } from '@/stores/layout'

const layoutStore = useLayoutStore()
</script>
