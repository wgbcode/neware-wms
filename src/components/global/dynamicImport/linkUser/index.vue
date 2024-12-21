<template>
  <div class="link-cell">
    <img v-if="!isHideText2Arrow" class="pointer" :src="iconLink" @click="handleClick" alt="SVG Icon" />
    <span class="link-cell-text">
      <span v-if="!isHideText2Arrow"> {{ linkCellText || text }}</span>
      <slot name="text">
        {{ otherText ? otherText : '' }}
      </slot>
    </span>
    <div class="tag">
      <span class="link-cell-top-tag">
        {{ currentUser ? currentUser.topTag : '' }}
        <slot name="tag">
          {{ tag ? tag : '' }}
        </slot>
      </span>
      <span class="link-cell-bottom-tag">
        {{ currentUser ? currentUser.bottomTag : '' }}
        <slot name="bottom-tag"> </slot>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { postMessage } from '@/hooks/useMessage'
import { ref, computed, watch } from 'vue'
import { getURL } from '@/utils/common'
import { authStore } from '@/stores/auth'

// 参数
const props = defineProps({
  type: {
    type: String,
    default: '' // type 不同，bottomTag 取值不同
  },
  userId: {
    type: String,
    default: '' // 用户id
  },
  userName: {
    type: String,
    default: '' // 用户名
  },
  text: {
    type: [String, Number],
    default: '' // 文本内容,当匹配到用户时，text无效
  },
  tag: {
    type: String,
    default: '' // 标签
  },
  // 是否显示文本和箭头
  isHideText2Arrow: {
    type: Boolean,
    default: false
  }
})
const typeKey = computed(() => {
  const typeMap: AnyObject<string> = {
    salesman: 'saleOrderCount'
  }
  return props.type ? typeMap[props.type] : 'serviceOrderNum'
})
const currentUser = ref<AnyObject>({
  userId: '',
  userName: '',
  org: '',
  topTag: 0,
  bottomTag: 0
})
const otherText = ref<string>('')
// icons
const iconLink = getURL('assets/icons/icon-link.svg')
const dataGroup = computed(() => {
  const allUserList = authStore.getAllUserList as AnyObject
  const { userId, userName, text } = props
  return { allUserList, userId, userName, text }
})
const linkCellText = computed(() => {
  let userName = ''
  if (currentUser.value.org) {
    userName += `${currentUser.value.org}-`
  }
  if (currentUser.value.userName) {
    userName += `${currentUser.value.userName}`
  }
  return userName
})
watch(
  dataGroup,
  (value) => {
    const { allUserList, userId, userName, text } = value
    if (allUserList?.length > 0 && (userId || userName)) {
      const userRowById = allUserList.find((user: any) => user.userId == userId)
      let userRowByName = {} as AnyObject
      if (userName) {
        const name = userName.includes('-') ? userName.split('-')[1] : userName
        userRowByName = allUserList.find((user: any) => user.userName == name)
        if (!userRowByName) {
          userRowByName = allUserList.find((user: any) => user.userName == name && !user.org)
        }
      }
      const item: AnyObject = userRowById || userRowByName
      if (item) {
        currentUser.value.userId = item.userId
        currentUser.value.userName = item.userName || item.name
        currentUser.value.org = item.org
        currentUser.value.topTag = item.seniority
        currentUser.value.bottomTag = item[typeKey.value] // 根据 type 取不同的字段
        // 特殊处理：总经理钉钉是韦生，取韦京生
        if (currentUser.value.userName == '韦生') {
          currentUser.value.userName = '韦京生'
        }
        otherText.value = ''
        return
      } else {
        otherText.value = text as string
      }
    }
    otherText.value = text as string
  },
  { deep: true, immediate: true }
)
// emits
const emits = defineEmits(['click'])
function handleClick(...args: any[]) {
  let param = {
    userName: currentUser.value.userName,
    userId: currentUser.value.userId
  }
  postMessage('getStaffInfo', param)
  emits('click', args)
}
</script>
<style lang="scss" scoped>
.link-cell {
  display: flex;
  align-items: center;
  max-height: 20px;
}
.pointer {
  cursor: pointer;
  margin-right: 2px;
}
.tag {
  position: relative;
  height: 20px;
  .link-cell-top-tag {
    display: inline-block;
    white-space: nowrap;
    margin-left: 0px;
    transform: scale(0.75); // 10px
    transform-origin: top left; // 左边作为源点
    position: absolute;
    top: -3px;
    left: 2px;
    color: #4ed8d0;
  }
  .link-cell-bottom-tag {
    display: inline-block;
    white-space: nowrap;
    margin-left: 0px;
    transform: scale(0.75); // 10px
    transform-origin: bottom left; // 左边作为源点
    position: absolute;
    bottom: -1px;
    left: 2px;
    color: #42a4f4;
  }
}
</style>
