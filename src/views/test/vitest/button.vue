<template>
  <button class="test1 test2">
    {{ buttonText }}
  </button>
</template>

<script setup lang="tsx">
defineProps({
  buttonText: String
})
</script>

<style scoped lang="scss"></style>
