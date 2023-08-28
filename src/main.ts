import '@/styles/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import Icon from '@/components/global/Icon.vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import '@/permission'

const app = createApp(App)
const pinia = createPinia()

// 全局注册 element Icon 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 自定义 Icon 组件
app.component('Icon', Icon)

app
  .use(pinia)
  .use(router)
  .use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn })
  .use(VueVirtualScroller)
  .mount('#app')
