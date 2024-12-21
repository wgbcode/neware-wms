<template>
  <div class="wrapper" v-if="showOfficeView">
    <div class="content">
      <img class="office office-img" v-if="officeValue.type === 'img'" :src="officeValue.url" />
      <vue-office-docx class="office" v-if="officeValue.type === 'docx'" :src="officeValue.url" />
      <vue-office-excel class="office" v-if="officeValue.type === 'excel'" :src="officeValue.url" />
      <vue-office-pdf class="office" v-if="officeValue.type === 'pdf'" :src="officeValue.url" />
    </div>
    <!-- absolute -->
    <p class="title c-no-select">{{ '第' + (currentIndex + 1) + '页/共' + officeData.length + '页' }}</p>
    <div class="footer">
      <Icon class="icon" name="btn-office-shrink" color="#B3B3B3" size="30" style="cursor: not-allowed" />
      <Icon class="icon" name="btn-office-enlarge" color="#B3B3B3" size="30" style="cursor: not-allowed" />
      <Icon class="icon" name="btn-office-rotate-left" color="#B3B3B3" size="29" style="cursor: not-allowed" />
      <Icon class="icon" name="btn-office-rotate-right" color="#B3B3B3" size="29" style="cursor: not-allowed" />
      <a :href="officeValue.url" :target="['pdf', 'img'].includes(officeValue.type) ? '_blank' : '_self'" style="cursor: pointer">
        <Icon class="icon" name="btn-office-download" color="#B3B3B3" size="27" />
      </a>
    </div>
    <Icon class="icon-left" name="btn-office-left" color="#B3B3B3" size="50" :click="subtractIndex" :style="iconLeftStyle" />
    <Icon class="icon-right" name="btn-office-right" color="#B3B3B3" size="50" :click="addIndex" :style="iconRightStyle" />
    <Icon class="icon-close" name="btn-office-close" color="#B3B3B3" size="50" :click="hideOffice" />
  </div>
</template>

<script setup lang="tsx">
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'
import VueOfficePdf from '@vue-office/pdf'
import '@vue-office/docx/lib/index.css'
import '@vue-office/excel/lib/index.css'
import { shallowRef, computed } from 'vue'

export type OfficeData = {
  type: 'docx' | 'excel' | 'pdf' | 'img'
  url: string
}
const currentIndex = shallowRef<number>(0)
const showOfficeView = shallowRef<boolean>(false)
const officeData = shallowRef<OfficeData[]>([])
const officeValue = computed<OfficeData>(() => officeData.value[currentIndex.value])
const iconLeftStyle = computed<Record<string, string>>(() => ({ cursor: currentIndex.value === 0 ? ' not-allowed' : 'pointer' }))
const iconRightStyle = computed<Record<string, string>>(() => ({
  cursor: currentIndex.value === officeData.value.length - 1 ? ' not-allowed' : 'pointer'
}))
function subtractIndex() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
function addIndex() {
  if (currentIndex.value < officeData.value.length - 1) {
    currentIndex.value++
  }
}
function showOffice(params: OfficeData[]) {
  currentIndex.value = 0
  officeData.value = params
  showOfficeView.value = true
}
function hideOffice() {
  showOfficeView.value = false
}

defineExpose({ showOffice })
</script>

<style scoped lang="scss">
.wrapper {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  .content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 100vh;
    width: 80%;
    padding: 70px 0 0 0;
    .office {
      height: 100%;
    }
    &:has(.office-img) {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .title {
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4e5157;
    border-radius: 20px;
    font-size: 24px;
    padding: 2px 20px;
  }

  .footer {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #4e5157;
    border-radius: 30px;
    padding: 8px 20px;
    z-index: 999;
    display: flex;
    align-items: center;
    .icon {
      margin: 0 15px;
    }
  }

  .icon-left {
    position: absolute;
    top: 50%;
    left: 30px;
    transform: translateY(-50%);
  }
  .icon-right {
    position: absolute;
    top: 50%;
    right: 30px;
    transform: translateY(-50%);
  }
  .icon-close {
    position: absolute;
    top: 30px;
    right: 30px;
    cursor: pointer;
  }
}
</style>
