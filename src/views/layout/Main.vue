<template>
  <div class="c-flex-column c-flex-1">
    <TagsView ref="tagsView" />
    <router-view v-if="layoutStore.reloadRouter"
      class="c-absolute c-t28 c-b0 c-l0 c-r0 c-px10 c-py5 c-flex-column c-overflow-auto">
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TagsView from './TagsView.vue'
import { layoutStore } from '@/stores/layout'

const tagsView = ref<HTMLElement | null>(null)
</script>
