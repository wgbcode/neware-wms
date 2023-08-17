<template>
  <div>
    <section class="c-flex-between c-flex-only-wrap">
      <div class="c-flex-ycenter c-flex-only-wrap">
        <el-input v-model="purOrder" placeholder="采购单号" class="c-mr10 c-mb5" />
        <el-select-v2 v-model="purDelay" :options="delayOptions" placeholder="延期" class="c-mr10  c-mb5" />
        <el-select-v2 v-model="purStatus" :options="statusOptions" placeholder="状态" class="c-mr10  c-mb5" />
        <el-date-picker v-model="purDate" type="daterange" unlink-panels range-separator="-" start-placeholder="开始日期"
          end-placeholder="结束日期" :shortcuts="shortcuts" :size="size" class="c-mr10  c-mb5" popper-class="testxxx"
          :teleported="false" />
        <el-button type="primary" class="c-mr10  c-mb5">查询</el-button>
      </div>
      <div class="c-flex-ycenter  c-mb5">
        <el-button type="warning">箱号查询</el-button>
        <el-button type="warning">导出</el-button>
      </div>
    </section>
    <section class="c-flex-1 c-pt5 test2">
      <el-table :data="tableData" style="width: 100%" height="100%">
        <el-table-column fixed prop="date" label="Date" width="150" />
        <el-table-column prop="name" label="Name" width="120" />
        <el-table-column prop="state" label="State" width="120" />
        <el-table-column prop="city" label="City" width="320" />
        <el-table-column prop="address" label="Address" width="600" />
        <el-table-column prop="zip" label="Zip" width="120" />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 输入框
const purOrder = ref('')

// 日期选择器
const size = ref<'default' | 'large' | 'small'>('small')
const purDate = ref('')
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

// 下拉框选择器
const purDelay = ref()
const delayInit = ['是', '否']
const delayOptions = Array.from({ length: 2 }).map((_, idx) => ({
  value: `delay ${idx + 1}`,
  label: `${delayInit[idx % 10]}`
}))
const purStatus = ref()
const statusInit = ['待交货', '部分交货', '全部交货', '已对账', '已结算']
const statusOptions = Array.from({ length: 5 }).map((_, idx) => ({
  value: `delay ${idx + 1}`,
  label: `${statusInit[idx % 10]}`
}))

// 表格
const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036'
  }
]
</script>

<style scoped lang="scss">
:deep(.el-input) {
  width: 120px;
}

:deep(.el-date-editor.el-input__wrapper) {
  width: 200px
}

.el-select-v2 {
  width: 100px
}

:deep(.testxxx) {
  left: 10px !important
}
</style>
