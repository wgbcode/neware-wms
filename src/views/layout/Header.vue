<template>
    <div class="c-flex-between c-pl10">
        <section class="c-flex-ycenter">
            <Icon name="toggleAside" :color="color.color1" size="22px" class="c-mb1" @mouseover="changeColor('color1')"
                @mouseout="restoreColor('color1')" @click.prevent="toggleAideBar" />
            <ul class="version-info c-ml16 c-fs18 c-flex-ycenter c-forbidSelect">
                <li class="c-mr5 c-fw700">WMS 5.0.0</li>
                <li class="c-fw700">(2023.08.10)</li>
            </ul>
        </section>
        <section class="c-flex-ycenter">
            <div class="c-flex-ycenter c-mx10" @mouseover="changeColor('color2')" @mouseout="restoreColor('color2')"
                @click="toggleTheme()">
                <Icon name="theme-dark" :color="color.color2" size="20px" v-show="isShowIcon" />
                <Icon name="theme-light" :color="color.color2" size="20px" v-show="!isShowIcon" />
            </div>
            <div class="c-flex-ycenter c-mx10" @click="refreshPage" @mouseover="changeColor('color3')"
                @mouseout="restoreColor('color3')">
                <Icon name="refresh-page" :color="color.color3" size="20px" class="c-mr5" />
                <span class="c-mt2 c-fs14 c-cwhite c-forbidSelect" :style="{ color: color.color3 }">刷新页面</span>
            </div>
            <div class="c-flex-ycenter c-mx10" @click="userLogout" @mouseover="changeColor('color4')"
                @mouseout="restoreColor('color4')">
                <Icon name="logout" :color="color.color4" size="18px" class="c-mr5" />
                <span class="c-mt2 c-fs14 c-cwhite c-forbidSelect" :style="{ color: color.color4 }">安全退出</span>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { useLayoutStore } from '@/stores/layout'
import router from '@/router';

const layoutStore = useLayoutStore()

// 侧边栏隐藏和显示
const toggleAideBar = () => layoutStore.toogleAside()

// 退出登录
const userLogout = () => router.push({ name: 'login' })

// 刷新页面
const refreshPage = () => router.go(0)

// 主题切换
const isShowIcon = ref(true)
const isDark = useDark({ valueDark: 'dark', valueLight: 'light' })
const toggleTheme = () => {
    localStorage.getItem('vueuse-color-scheme') === 'light'
        ? (isShowIcon.value = false)
        : (isShowIcon.value = true)
    useToggle(isDark)()
}

// 展示悬浮色
const color = reactive({
    color1: '#fff',
    color2: '#fff',
    color3: '#fff',
    color4: '#fff'
})
const changeColor = (key: string) => {
    switch (key) {
        case 'color1':
            color[key] = 'var(--tc-brand)'
            break
        case 'color2':
            color[key] = 'var(--tc-brand)'
            break
        case 'color3':
            color[key] = 'var(--tc-brand)'
            break
        case 'color4':
            color[key] = 'var(--tc-brand)'
            break
    }
}
const restoreColor = (key: string) => {
    switch (key) {
        case 'color1':
            color[key] = '#fff'
            break
        case 'color2':
            color[key] = '#fff'
            break
        case 'color3':
            color[key] = '#fff'
            break
        case 'color4':
            color[key] = '#fff'
            break
    }
}
</script>

<style scoped lang="scss">
.version-info {
    color: var(--tc-brand);
}
</style>
