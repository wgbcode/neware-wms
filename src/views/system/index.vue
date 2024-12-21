<template>
  <div class="wrapper c-flex">
    <Aside class="aside c-w180" :isSystem="true" />
    <router-view class="c-flex-1 c-p10" style="width: calc(100% - 180px)" />
  </div>
</template>

<script setup lang="tsx">
import router from '@/router'
import Aside from '@/views/layout/Aside.vue'
import { onMounted } from 'vue'
onMounted(() => {
  const curRoute = router.currentRoute.value
  const path = curRoute.meta.isSys ? curRoute.path : '/roleManager'
  router.push({ path })
})
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 0 !important;

  .aside {
    background-color: var(--tc-common-40);
    margin-left: -20px;

    :deep(.el-menu) {
      background-color: var(--tc-common-40);
    }

    :deep(.el-row) {
      height: 100%;
    }

    :deep(.c-forbidSelect) {
      width: 180px;
    }

    :deep(.el-sub-menu__title:hover),
    :deep(.el-menu-item:hover) {
      background-color: var(--tc-table-select-hover);
    }
  }
}
</style>
