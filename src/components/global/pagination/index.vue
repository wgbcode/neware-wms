<template>
    <el-pagination v-model:current-page="curPage" v-model:page-size="pageSize" v-on="config.on" :total="config.total"
        :page-sizes="pageSizeArr" layout="total, sizes, prev, pager, next, jumper" />
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

type Config = {
    curPage: number,
    pageSize: number,
    total: number,
    pageSizeArr?: Object,
    on: {
        'current-change': Function,
        'size-change': Function
    }
}
const props = defineProps({
    config: {
        type: Object as PropType<Config>,
        required: true
    }
})
const pageSizeArr = props.config.pageSizeArr || [35, 100, props.config.total]
const curPage = computed(() => props.config.curPage)
const pageSize = computed(() => props.config.pageSize)
</script>