<template>
  <el-date-picker v-on="on ?? {}" />
</template>
<script setup lang="ts">
defineProps(['on'])
</script>
