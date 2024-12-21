<template>
  <div>
    <el-sub-menu v-if="item.children && item.children.length > 0" :index="item.path">
      <template #title>
        <Icon :name="item.meta.icon" color="#fff" size="18px" />
        <span class="c-ml5">{{ item.meta.title }}</span>
      </template>
      <!-- 组件递归 -->
      <AsideItem v-for="route in item.children" :key="route.name" :item="route" />
    </el-sub-menu>

    <el-menu-item v-else :index="item.path">
      <Icon :name="item.meta.icon" color="#fff" size="18px" />
      <span>{{ item.meta.title }}</span>
    </el-menu-item>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  item: {
    type: Object
  }
})
const item = props.item!
</script>

<style scoped lang="scss">
:deep(.el-menu-item) {
  margin-left: -10px;
}
</style>
