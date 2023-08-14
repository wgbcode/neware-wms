<template>
  <div class="c-flex-column c-flex-1">
    <TagsView />
    <router-view> </router-view>
  </div>
</template>

<script setup lang="ts">
import TagsView from './TagsView.vue'
</script>

<style scoped></style>
