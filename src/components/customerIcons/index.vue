<template>
  <section style="display: inline-block; height: 20px" :style="{ width: `${autoWidth}px` }">
    <section :class="getCustomerClas()">
      <div class="tag-num">
        <div class="link-cell-top-tag">{{ data.registerYears }}</div>
        <div class="link-cell-bottom-tag">{{ data.orderCount }}</div>
      </div>
      <div class="inlin-block" :style="getMarginLeft(data)">
        <!-- 冻结 -->
        <img v-if="data.frozenFor == 'Y'" :src="iconLock" class="level" alt="" />
        <!-- 客户是否可用 -->
        <img v-if="isCustomerPage && data.isValid" :src="iconGreenLock" alt="可用" class="icon-lock" :class="{ 'lock-left': !data.registerYears }" />
        <img v-if="isCustomerPage && !data.isValid" :src="iconRedLock" class="level" alt="" />
        <!-- 客户等级 -->
        <img v-if="!!data.customerLevel" :src="getCustomerLevelSrc(data)" class="level" alt="" />
        <!-- Fat -->
        <img class="code-img" v-if="data.isFat" :src="getCustomerTagImg('isFat')" alt="" />
        <!-- 中间商 -->
        <img class="code-img" v-if="data.isReseller" :src="getCustomerTagImg('isReseller')" alt="" />
        <span class="ml-2" :style="{ color: getAddressColor(validateAreaMark(data)) }" v-if="validateAreaMark(data)">{{
          validateAreaMark(data)
        }}</span>
        <!-- 国有企业-->
        <img class="code-img" v-if="data.enterpriseType === '119'" :src="customerType" alt="" />
      </div>
    </section>
  </section>
</template>

<script setup lang="tsx">
import { computed, type PropType } from 'vue'
import * as customerLevelImg from './customerLevelList'
import iconLock from '@/assets/images/icon-lock.svg'
import iconGreenLock from '@/assets/images/icon-green-unlock.svg'
import iconRedLock from '@/assets/images/red-lock.svg'
import customerType from '@/assets/images/icon-type.svg'
import { validateAreaMark } from '@/utils/bi'

export type ClientInfo = {
  customerLevel: string
  enterpriseType: string | null
  frozenFor: string
  isFat: number
  isReseller: boolean
  isValid: boolean
  orderCount: number | null
  registerYears: string
}

const props = defineProps({
  data: {
    type: Object as PropType<ClientInfo>,
    default: () => {}
  },
  isTitle: {
    type: Boolean,
    default: false
  },
  // 标识是客户列表页的
  isCustomerPage: {
    type: Boolean,
    default: false
  }
})
const autoWidth = computed(() => {
  let width = 1
  // 角标
  if (props.data?.registerYears) {
    width += 20
  }
  // 客户等级
  if (props.data?.customerLevel) {
    width += 18
  }
  // Fat
  if (props.data?.isFat) {
    width += 17
  }
  // 中间商
  if (props.data?.isReseller) {
    width += 17
  }
  // 全球地区
  if (validateAreaMark(props.data)) {
    width += 17
  }
  // 全球地区
  if (props.data?.enterpriseType === '119') {
    width += 19
  }
  return width
})
// 客户等级
function getCustomerLevelSrc(data: ClientInfo) {
  const { customerLevel } = data
  let themeStyle = localStorage.getItem('styleTheme')
  if (customerLevel == 'S') {
    return customerLevelImg.S
  } else if (customerLevel == 'A') {
    return customerLevelImg.A
  } else if (customerLevel == 'B') {
    if (themeStyle === 'light') {
      return customerLevelImg.BL
    } else {
      return customerLevelImg.BD
    }
  } else if (customerLevel == 'C') {
    if (themeStyle === 'light') {
      return customerLevelImg.CL
    } else {
      return customerLevelImg.CD
    }
  } else if (customerLevel == 'D') {
    if (themeStyle === 'light') {
      return customerLevelImg.DL
    } else {
      return customerLevelImg.DD
    }
  }
}
// 判断是否是否中间商或FAT客户
function getCustomerTagImg(type: keyof ClientInfo) {
  const param = props.data[type]
  return param ? (type === 'isFat' ? customerLevelImg.FAT_IMG : type === 'isReseller' ? customerLevelImg.RESELLER_IMG : '') : ''
}
// 获取地区颜色
function getAddressColor(data: string) {
  const colorMap: AnyObject<string> = {
    JP: '#EA3553',
    KR: '#42A4F4',
    US: '#42BF39',
    EU: '#E59500',
    AF: '#82A2AD',
    AS: '#13B3A8',
    SEA: '#C039B5',
    ME: '#F8F8B5',
    OA: '#825ECF',
    SA: '#A6179F'
  }
  return `${colorMap[data]} !important`
}
function getCustomerClas() {
  return !props.isTitle ? 'title-flag' : 'title-flag2'
}
function getMarginLeft(data: ClientInfo) {
  const { registerYears } = data
  let left = !props.isTitle && registerYears ? (Number(registerYears) >= 10 ? '28px' : '22px') : '2px'
  return {
    'margin-left': left
  }
}
</script>
<style lang="scss" scoped>
.title-flag {
  position: relative;
  display: inline-block;
  .inlin-block {
    display: inline-block;
    position: absolute;
    top: 1px;
  }
  img {
    width: 12px;
  }
  .level {
    margin: 0 0 0 4px !important;
    transform: scale(1.1) !important;
  }
  .code-img {
    margin-left: 2px;
    width: 15px;
    height: 12px;
  }
  .ml-2 {
    margin-left: 2px;
  }
  .tag-num {
    position: relative;
    height: 20px;
    display: inline-block;
    .link-cell-top-tag {
      display: inline-block;
      white-space: nowrap;
      margin-left: 0px;
      transform: scale(0.78); // 10px
      transform-origin: top left; // 左边作为源点
      position: absolute;
      top: -3px;
      left: 2px;
      color: #ea3553;
    }
    .link-cell-bottom-tag {
      display: inline-block;
      white-space: nowrap;
      margin-left: 0px;
      transform: scale(0.78); // 10px
      transform-origin: bottom left; // 左边作为源点
      position: absolute;
      bottom: 0;
      left: 2px;
      color: #42a4f4;
    }
  }
}
.title-flag2 {
  position: relative;
  display: inline-block;
  .inlin-block {
    display: inline-block;
  }
  img {
    width: 12px;
  }
  .level {
    margin: 0 0 0 -2px !important;
    transform: scale(1.1) !important;
  }
  .code-img {
    margin-left: 2px;
    width: 15px;
    height: 12px;
  }
  .ml-2 {
    margin-left: 2px;
  }
  .tag-num {
    position: relative;
    height: 20px;
    display: inline-block;
    .link-cell-top-tag {
      display: inline-block;
      white-space: nowrap;
      transform: scale(0.78); // 10px
      transform-origin: top left; // 左边作为源点
      top: -3px;
      color: #ea3553;
    }
    .link-cell-bottom-tag {
      position: absolute;
      display: inline-block;
      white-space: nowrap;
      transform: scale(0.78); // 10px
      transform-origin: bottom left; // 左边作为源点
      bottom: -3px;
      left: 0;
      color: #42a4f4;
    }
  }
}
</style>
