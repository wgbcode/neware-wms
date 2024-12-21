<template>
  <div class="c-h18 c-flex-ycenter">
    <el-date-picker
      v-model="data.time"
      size="small"
      type="daterange"
      range-separator="—"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      value-format="YYYY.MM.DD"
      format="YYYY.MM.DD"
    />
  </div>
</template>

<script setup lang="tsx">
const data = defineModel<FooterData>('data', { required: true })
</script>

<style scoped lang="scss">
:deep(.el-date-editor) {
  height: 18px;
  margin-left: 20px;
  flex-grow: 0;
  width: 200px;
  margin-right: 10px;
}
:deep(.el-range-separator) {
  padding: 0 5px 2px 5px;
  color: var(--tc-primary-text);
}
</style>
