<template>
  <div>
    <Search :configData="configData" :queryParams="queryParams" />
  </div>
</template>

<script setup lang="ts">
import Search from '@/components/global/search/index.vue'
import { reactive, watch } from 'vue';

const configData = reactive([
  {
    name: 'button'
  }, {
    name: 'select',
  }, {
    name: 'input',
    prop: 'testSelect'
  }
])
const queryParams = reactive({
  testSelect: 'testSelect'
})

watch(queryParams, (value, preValue) => {
  console.log(value, preValue);
})

</script>

<style scoped lang="scss"></style>
