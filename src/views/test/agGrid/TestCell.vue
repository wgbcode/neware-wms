<template>
  <div>{{ value }}</div>
</template>

<script setup lang="tsx">
import type { ICellRendererParams } from 'ag-grid-community'
interface Props {
  params: ICellRendererParams
}
const props = defineProps<Props>()
const { value } = props.params
</script>

<style scoped></style>
