<template>
  <div>
    <span :class="layout === 'between' ? 'c-flex-between' : 'c-flex-ycenter'">
      <Icon
        v-if="value"
        style="min-width: 12px"
        name="arrow"
        color="var(--tc-brand)"
        size="12"
        class="c-mr2 c-mb1 c-cursor-p"
        @click.stop="() => click({ row: data })"
      />
      <span class="c-tooltip">
        {{ formatTextFn ? formatTextFn(value) : value }}
      </span>
    </span>
  </div>
</template>

<script setup lang="tsx">
import type { ICellRendererParams } from 'ag-grid-community'
interface Props {
  params: ICellRendererParams
}
const props = defineProps<Props>()
const { value, colDef, data } = props.params
const { formatTextFn, click, layout } = colDef?.context ?? {}
</script>

<style scoped lang="scss"></style>
