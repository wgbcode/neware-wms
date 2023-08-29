<template>
  <div>
    <Search :configData="configData" :queryParams="queryParams" />
  </div>
</template>

<script setup lang="ts">
import Search from '@/components/global/search/index.vue'
import { reactive, watch } from 'vue'

const initials = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
const options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `Option${idx + 1}`,
  label: `${initials[idx % 10]}${idx}`,
}))

const configData = reactive([
  {
    name: 'button'
  }, {
    name: 'input',
    prop: 'testInput'
  }, {
    name: 'select',
    prop: 'testSelect',
    attr: {
      options
    }
  }
])
const queryParams = reactive({
  testInput: '',
  testSelect: null,
})



watch(queryParams, (value, preValue) => {
  console.log(value, preValue);
})

</script>

<style scoped lang="scss"></style>
