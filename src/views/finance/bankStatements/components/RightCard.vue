<template>
  <div class="c-h100p c-pl5 c-flex-column">
    <div style="min-height: 25px">
      <ul class="tab-wrapper">
        <template v-for="item in tabs" :key="item.key">
          <li v-show="item.show" :class="{ 'is-active': curComponent === item.key }" @click="switchTab(item.key)">
            {{ item.name }}
          </li>
        </template>
      </ul>
    </div>
    <div class="c-flex-1 c-mt5 c-overflow-auto" v-loading="loading">
      <!-- 收款模块 -->
      <AcceptMoney v-if="curComponent === compNameMap.acceptMoney" :ref="compNameMap.acceptMoney" v-bind="$attrs" />
      <!-- 付款模块 -->
      <PayMoney v-if="curComponent === compNameMap.payMoney" :ref="compNameMap.payMoney" v-bind="$attrs" />
    </div>
    <div v-show="isShowRight" class="c-flex-xcenter c-my10">
      <el-button type="warning" @click="submitData" :loading="btnLoading">
        <Icon v-if="!btnLoading" name="submit" color="black" size="13" />
        <span class="c-ml4">提交</span>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="tsx">
import type { RowData } from '@/views/finance/bankStatements/types'
import { shallowRef, computed, useTemplateRef, nextTick } from 'vue'
import AcceptMoney from './components/AcceptMoney.vue'
import PayMoney from './components/PayMoney.vue'
import { ElMessageBox } from 'element-plus'

export type ModeMap = {
  add: boolean // 新增
  acceptMoney: boolean // 收款
  payMoney: boolean // 付款
}
type Tabs = {
  key: 'acceptMoney' | 'payMoney'
  name: '收款' | '付款'
  show: boolean
}
type CompNameMapValue = (typeof compNameMap)[keyof typeof compNameMap]

defineProps({
  isShowRight: {
    type: Boolean,
    required: true
  }
})

const compNameMap: Record<string, 'acceptMoney' | 'payMoney'> = {
  acceptMoney: 'acceptMoney',
  payMoney: 'payMoney'
}

const loading = shallowRef<boolean>(false)
const btnLoading = shallowRef<boolean>(false)
const selectData = shallowRef<RowData[]>([])
const curComponent = shallowRef<CompNameMapValue>(compNameMap.acceptMoney)

const modeMap = computed<ModeMap>(() => {
  // 非新增，即 selectData.length 不为 0 时
  // outAmt 和 inAmt 有且仅有一个等于 0，不然就是后端返回的数据有问题
  const sData = selectData.value
  const inAmt = sData.reduce((a, b) => a + b.inAmount, 0)
  const outAmt = sData.reduce((a, b) => a + b.outAmount, 0)
  return {
    add: sData.length === 0, // 新增
    acceptMoney: sData.length !== 0 && outAmt === 0, // 收款
    payMoney: sData.length !== 0 && inAmt === 0 // 付款
  }
})
const tabs = computed<Tabs[]>(() => {
  const { add, acceptMoney, payMoney } = modeMap.value
  return [
    { key: compNameMap.acceptMoney, name: '收款', show: add || acceptMoney },
    { key: compNameMap.payMoney, name: '付款', show: add || payMoney }
  ]
})

const acceptMoneyInstance = useTemplateRef<InstanceType<typeof AcceptMoney> | null>(compNameMap.acceptMoney)
const payMoneyInstance = useTemplateRef<InstanceType<typeof PayMoney> | null>(compNameMap.payMoney)

// 组件数据初始化
function initData(currentSelectData: RowData[]) {
  selectData.value = currentSelectData
  const { add, acceptMoney, payMoney } = modeMap.value
  const compName = new Map([
    [add, compNameMap.acceptMoney],
    [acceptMoney, compNameMap.acceptMoney],
    [payMoney, compNameMap.payMoney]
  ]).get(true)
  compName && renderComponent(compName)
}

async function renderComponent(name: CompNameMapValue) {
  curComponent.value = name
  await nextTick()
  const initParams = {
    currentSelectData: selectData.value,
    currentModeMap: modeMap.value,
    currentCurComponent: curComponent.value
  }
  curComponent.value === compNameMap.acceptMoney && acceptMoneyInstance.value!.initData(initParams)
  curComponent.value === compNameMap.payMoney && payMoneyInstance.value!.initData(initParams)
}

// 切换 tabs
function switchTab(key: CompNameMapValue) {
  ElMessageBox.confirm('切换后将会清除当前模块数据，确定切换吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    renderComponent(key)
  })
}

// 提交数据
function submitData() {
  curComponent.value === compNameMap.acceptMoney && acceptMoneyInstance.value?.submitData()
  curComponent.value === compNameMap.payMoney && payMoneyInstance.value?.submitData()
}

// 将组件方法暴露出去
defineExpose({ initData })
</script>

<style scoped lang="scss">
.tab-wrapper {
  display: flex;
  height: 25px;
  li {
    padding: 0 20px;
    height: 25px;
    white-space: nowrap;
    font-size: 14px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    color: var(--tc-primary-text);
    cursor: pointer;
    &:hover {
      color: var(--tc-global-yellow);
    }
    &.is-active {
      background-color: #6a5b2a;
      color: var(--tc-highlight-text);
    }
  }
}

:deep(.el-collapse) {
  border: none;
  .el-collapse-item {
    button,
    button .title {
      color: var(--tc-primary-text);
      font-weight: 700;
    }
    li {
      font-size: 13px;
      color: var(--tc-primary-text);
      .label {
        font-size: 12px;
        font-weight: 700;
        color: var(--tc-primary-text);
      }
      .value {
        font-size: 12px;
        color: var(--tc-primary-text);
      }
    }
    .el-collapse-item__content {
      line-height: 1;
    }
  }
}
:deep(.custom-input-number) {
  height: 18px;
  line-height: 18px;
  .el-input__wrapper {
    box-shadow: none;
    border-radius: 0;
    .el-input__inner {
      text-align: right;
    }
  }
}
:deep(.custom-select) {
  line-height: 18px;
  height: 18px;
  min-height: 18px;
  .el-select__wrapper {
    padding: 0;
    box-shadow: none;
    line-height: 18px;
    height: 18px;
    min-height: 18px;
    border-radius: 0;
  }
}
:deep(.custom-suffix) {
  margin-left: 4px;
  color: var(--tc-label-text);
}
:deep(.ag-cell:has(.el-input__wrapper.is-focus)),
:deep(.ag-cell:has(.el-select__wrapper.is-focused)) {
  border-bottom: 1px solid var(--tc-global-yellow) !important;
}
:deep(.custom-date-picker .el-input__wrapper) {
  box-shadow: none;
  height: 18px;
  line-height: 18px;
  padding: 0;
}
</style>
