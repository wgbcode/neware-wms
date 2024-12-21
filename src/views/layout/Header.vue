<template>
  <div class="c-flex-between c-pl10">
    <section class="c-flex-ycenter">
      <Icon
        name="toggleAside"
        :color="color.color1"
        size="22px"
        class="c-mb1 c-cursor-p"
        @mouseover="changeColor('color1')"
        @mouseout="restoreColor('color1')"
        @click.prevent="toggleAideBar"
      />
      <ul class="version-info c-ml16 c-fs18 c-flex-ycenter c-forbidSelect">
        <li class="c-mr5 c-fw700">NewAre</li>
        <li class="c-fw700"></li>
      </ul>
    </section>
    <section class="c-flex-ycenter">
      <div class="c-flex-ycenter c-mx10 c-cursor-p" @mouseover="changeColor('color2')" @mouseout="restoreColor('color2')" @click="toggleTheme()">
        <Icon name="theme-dark" :color="color.color2" size="20px" v-show="isShowIcon" />
        <Icon name="theme-light" :color="color.color2" size="20px" v-show="!isShowIcon" />
      </div>
      <div class="c-flex-ycenter c-mx10 c-cursor-p" @click="refreshPage" @mouseover="changeColor('color3')" @mouseout="restoreColor('color3')">
        <Icon name="refresh-page" :color="color.color3" size="20px" class="c-mr5" />
        <span class="c-mt2 c-fs14 c-cwhite c-forbidSelect" :style="{ color: color.color3 }">刷新页面</span>
      </div>
      <div class="c-flex-ycenter c-mx10 c-cursor-p" @click="userLogout" @mouseover="changeColor('color4')" @mouseout="restoreColor('color4')">
        <span class="c-mt2 c-fs14 c-cwhite c-forbidSelect" :style="{ color: color.color4 }">
          {{ authStore.userInfo ? authStore.userInfo?.orgName + '-' + authStore.userInfo?.userName : '' }}
        </span>
      </div>
      <div class="c-flex-ycenter c-mx10 c-cursor-p" @click="userLogout" @mouseover="changeColor('color5')" @mouseout="restoreColor('color5')">
        <Icon name="logout" :color="color.color5" size="18px" class="c-mr5" />
        <span class="c-mt2 c-fs14 c-cwhite c-forbidSelect" :style="{ color: color.color5 }">安全退出</span>
      </div>
      <!-- 暂时只有超管才能进入配置页面 -->
      <div
        v-if="authStore.userInfo?.account === 'ErpAdmin'"
        class="c-flex-ycenter c-mx10 c-cursor-p"
        @click="goSystem"
        @mouseover="changeColor('color6')"
        @mouseout="restoreColor('color6')"
      >
        <Icon name="setting" :color="color.color6" size="18px" class="c-mr5" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { layoutStore } from '@/stores/layout'
import { appStore } from '@/stores/app'
import router from '@/router'
import { removeToken } from '@/utils/auth'
import { authStore } from '@/stores/auth'

// 侧边栏隐藏和显示
const toggleAideBar = () => layoutStore.toogleAside()

// 退出登录
const userLogout = () => {
  router.push({ name: 'login' })
  removeToken()
  authStore.removeToken()
  authStore.removeUserInfo()
  sessionStorage.removeItem('VU3PINIASTATE')
  router.removeRoute('layout')
}

// 刷新页面
const refreshPage = () => router.go(0)

// 主题切换
const isShowIcon = ref(true)
const isDark = useDark({ valueDark: 'dark', valueLight: 'light' })
const toggleTheme = async () => {
  useToggle(isDark)()
  await nextTick()
  localStorage.getItem('vueuse-color-scheme') === 'light'
    ? ((isShowIcon.value = false), appStore.saveStyleTheme('light'))
    : ((isShowIcon.value = true), appStore.saveStyleTheme('dark'))
}

// 展示悬浮色
const color = reactive<Record<string, string>>({
  color1: '#fff',
  color2: '#fff',
  color3: '#fff',
  color4: '#fff',
  color5: '#fff',
  color6: '#fff'
})
const changeColor = (key: string) => (color[key] = 'var(--tc-brand)')
const restoreColor = (key: string) => (color[key] = '#fff')

// 跳转到系统配置页
const goSystem = () => router.push({ name: 'systemSetting' })

onMounted(() => {
  localStorage.getItem('vueuse-color-scheme') === 'light' ? appStore.saveStyleTheme('light') : appStore.saveStyleTheme('dark')
})
</script>

<style scoped lang="scss">
.version-info {
  color: var(--tc-brand);
}
</style>
