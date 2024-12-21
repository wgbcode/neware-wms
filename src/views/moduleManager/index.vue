<template>
  <div class="c-flex c-w100">
    <LeftCard class="c-w40p" v-model:selectedRow="selectedRow" />
    <CenterCard class="c-w30p c-ml10" :selectedRow="selectedRow" />
    <RightCard class="c-w30p c-ml10" />
  </div>
</template>

<script setup lang="tsx">
import LeftCard from './components/leftCard/index.vue'
import CenterCard from './components/centerCard/index.vue'
import RightCard from './components/rightCard/index.vue'
import { shallowRef, watch } from 'vue'
import { type Modules } from '@/hooks/useSysBaseData'

const selectedRow = shallowRef<Modules>()
watch(selectedRow, (selectedRow) => console.log({ selectedRow }))
</script>

<style scoped lang="scss"></style>
