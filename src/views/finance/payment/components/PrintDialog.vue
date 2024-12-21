<template>
  <el-dialog v-model="dialogVisible" title="打印预览" width="900" :append-to-body="true" draggable>
    <div id="payOrder" class="wrapper" style="width: calc(100% - 2px)">
      <h2 class="title">
        付款单
        <i>2024.07.02</i>
      </h2>
      <ul class="content">
        <li>
          <label class="first-label"> <i class="required">*</i>收款单位 </label>
          <span></span>
        </li>
        <li>
          <label class="first-label"> <i class="required">*</i>收款账号 </label>
          <el-input
            ref="payAccount"
            v-show="formShow.payAccount"
            @blur="formShow.payAccount = false"
            @change="formShow.payAccount = false"
            v-model="formData.payAccount"
            class="first-value min-width-250"
          />
          <span v-show="!formShow.payAccount" @click="toggleForm('payAccount')" class="first-value min-width-250">{{ formData.payAccount }}</span>
          <label class="second-label"> <i class="required">*</i>开户行 </label>
          <span></span>
        </li>
        <li>
          <label class="first-label"> 付款单位 </label>
          <el-input
            ref="payName"
            v-show="formShow.payName"
            @change="formShow.payName = false"
            @blur="formShow.payName = false"
            v-model="formData.payName"
          />
          <span v-show="!formShow.payName" @click="toggleForm('payName')">{{ formData.payName }}</span>
        </li>
        <li>
          <label class="first-label">付款账号</label>
          <span class="first-value min-width-250"></span>
          <label class="second-label">开户行</label>
          <span></span>
        </li>
        <li>
          <label class="add-left-border remove-right-border c-pl15">金额（大写）</label>
          <span></span>
          <label class="remove-right-border c-pl15">付款金额</label>
          <span></span>
        </li>
        <li>
          <label class="first-label min-height-80">备注</label>
          <el-input
            ref="remark"
            v-show="formShow.remark"
            @blur="formShow.remark = false"
            v-model="formData.remark"
            type="textarea"
            class="min-height-80"
          />
          <span v-show="!formShow.remark" @click="toggleForm('remark')" class="min-height-80">{{ formData.remark }}</span>
        </li>
      </ul>
      <div class="footer">
        <label>经办：</label>
        <span></span>
        <label>审核：</label>
        <span></span>
        <label>批准：</label>
        <span></span>
      </div>
    </div>
    <template #footer>
      <div class="c-flex-center">
        <el-button @click="dialogVisible = false" class="c-mr30">
          <Icon name="btn-close" size="13px" class="c-mr2" />
          <span>取消</span>
        </el-button>
        <el-button ref="printBtn" v-print="printOption" style="position: fixed; top: -999px; left: -999px" />
        <el-button type="warning" :loading="printLoading" @click="printPayOrder">
          <Icon v-show="!printLoading" name="btn-print" size="14px" class="c-mr2" />
          <span>打印</span>
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { shallowRef, reactive, nextTick } from 'vue'
const dialogVisible = shallowRef<boolean>(false)
const printLoading = shallowRef<boolean>(false)
const formData = reactive<Record<string, string>>({ payAccount: '', payName: '', remark: '' })
const formShow = reactive<Record<string, boolean>>({ payAccount: false, payName: false, remark: false })
const payAccount = shallowRef()
const payName = shallowRef()
const remark = shallowRef()
const printBtn = shallowRef()
async function toggleForm(key: string) {
  formShow[key] = true
  await nextTick()
  payAccount.value?.focus()
  payName.value?.focus()
  remark.value?.focus()
}
const printOption = {
  id: 'payOrder',
  popTitle: '付款单打印',
  openCallback() {
    printLoading.value = false
  }
}
const printPayOrder = () => {
  printLoading.value = true
  const map = new Map([[!formData.payAccount, '付款账号不能为空']])
  const message = map.get(true)
  if (message) {
    printLoading.value = false
    ElMessage({ type: 'warning', message })
  } else {
    printBtn.value.$el.click()
  }
}
const openDialog = () => {
  dialogVisible.value = true
}
defineExpose({ openDialog })
</script>

<style scoped lang="scss">
// 打印样式配置
@media print {
  @page {
    size: auto;
    margin: 5mm 10mm;
  }
  body,
  html,
  div,
  ul,
  li {
    height: auto !important;
  }
}

.wrapper {
  .title {
    position: relative;
    text-align: center;
    padding-bottom: 10px;
    i {
      position: absolute;
      bottom: 5px;
      right: 10px;
      font-size: 14px;
    }
  }
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    --tc-border-color: #444141;
    --tc-row-height: 40px;
    li {
      display: flex;
      align-items: center;
      width: 100%;
      &:last-child {
        border-bottom: 1px solid var(--tc-border-color);
      }
      label {
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        border-top: 1px solid var(--tc-border-color);
        border-right: 1px solid var(--tc-border-color);
        min-height: var(--tc-row-height);
        color: var(--tc-label-text);
        .required {
          color: red;
          padding-right: 4px;
        }
      }
      span {
        display: flex;
        align-items: center;
        white-space: nowrap;
        border-top: 1px solid var(--tc-border-color);
        border-right: 1px solid var(--tc-border-color);
        width: 100%;
        padding-left: 4px;
        padding-right: 4px;
        min-height: var(--tc-row-height);
        color: var(--tc-primary-text);
      }
      :deep(.el-input),
      :deep(.el-textarea) {
        border-top: 1px solid var(--tc-border-color);
        border-right: 1px solid var(--tc-border-color);
        min-height: var(--tc-row-height);
        font-size: 14px;
        color: var(--tc-primary-text);
        .el-input__wrapper,
        .el-textarea__inner {
          border-radius: 0;
          box-shadow: none;
          &.is-focus {
            --el-input-focus-border-color: transparent;
            box-shadow: none;
          }
        }
        .el-textarea__inner {
          min-height: 78px !important;
          background-color: black;
        }
      }
      .first-label {
        width: 90px;
        min-width: 90px;
        border-left: 1px solid var(--tc-border-color);
      }
      .add-left-border {
        border-left: 1px solid var(--tc-border-color);
      }
      .second-label {
        min-width: 80px;
      }
      .first-value {
        width: 300px;
      }
      .remove-right-border {
        border-right: none;
      }
      .min-width-250 {
        min-width: 250px;
      }
      .min-height-80 {
        min-height: 80px;
      }
    }
  }
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 100px;
    margin-top: 15px;
    margin-bottom: 10px;
    font-size: 15px;
    label {
      display: inline-block;
      min-width: 100px;
      text-align: end;
    }
    span {
      display: inline-block;
      min-width: 100px;
    }
  }
}
</style>
