<template>
    <div>
        <el-input v-model="queryParams" placeholder="Please input" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const props = defineProps(['queryParams'])
const queryParams = ref(props.queryParams)
</script>

<style scoped lang="scss"></style>