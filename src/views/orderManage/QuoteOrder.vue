<template>
  <RecycleScroller class="scroller" :items="list" :item-size="32" key-field="id" v-slot="{ item }">
    <div class="user">
      {{ item.name }}
    </div>
  </RecycleScroller>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'

const list = reactive<any[]>([])
onMounted(() => {
  for (let i = 0; i <= 10000; i++) {
    list.push({ id: i, name: 'test' })
  }
})
</script>

<style scoped lang="scss">
.scroller {
  .user {
    height: 32%;
    padding: 0 12px;
    display: flex;
    align-items: center;
  }
}
</style>
