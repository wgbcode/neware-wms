<template>
  <div>
    <section class="c-flex-between c-flex-only-wrap">
      <CommonSearch :config="searchConfig" :queryList="queryList" />
    </section>
    <section class="c-flex-1 c-pt5 test2">
      <el-table :data="tableData" style="width: 100%" height="100%" v-loading="isLoading">
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
import { onMounted, reactive, ref, watch } from 'vue'

// 搜索栏
const onSearch = () => console.log('查询')
const searchConfig = reactive([
  {
    name: 'input',
    prop: 'purOrder',
    attr: {
      placeholder: '采购单号'
    }
  },
  {
    name: 'select',
    prop: 'isDelay',
    attr: {
      options: [
        {
          value: 0,
          label: '是'
        },
        {
          value: 1,
          label: '否'
        }
      ],
      placeholder: '延期'
    }
  },
  {
    name: 'select',
    prop: 'status',
    attr: {
      options: [
        {
          value: 0,
          label: '待交货'
        },
        {
          value: 1,
          label: '部分交货'
        },
        {
          value: 2,
          label: '全部交货'
        },
        {
          value: 3,
          label: '已对账'
        },
        {
          value: 4,
          label: '已结算'
        }
      ],
      placeholder: '状态'
    }
  },
  {
    name: 'date',
    prop: 'searchDate',
    attr: {
      type: 'daterange'
    }
  },
  {
    name: 'button',
    text: '查询',
    attr: {
      type: 'primary'
    },
    on: {
      click: onSearch
    }
  }
  ,
  {
    name: 'button',
    text: '箱号查询',
    attr: {
      type: 'warning'
    }
  },
  {
    name: 'button',
    text: '导出',
    attr: {
      type: 'warning'
    }
  }
])
const queryList = reactive({})

watch(queryList, (val) => {
  console.log('val', val)
})


// 表格
const isLoading = ref<boolean>(true)
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

onMounted(() => {
  const timer = setTimeout(() => {
    isLoading.value = false
    clearTimeout(timer)
  }, 3000)
})
</script>

