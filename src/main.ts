import '@/styles/main.css'
import { createApp, type Component } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import VueVirtualScroller from 'vue-virtual-scroller'
import Icon from '@/components/global/Icon.vue'
import Search from '@/components/global/search/index.vue'
import CommonTable from '@/components/global/table/index.vue'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import '@/permission'

const app = createApp(App)
const pinia = createPinia()

// 全局注册组件
const registerComponent = (mapObj: Record<string, Component>) => {
  for (const [key, component] of Object.entries(mapObj)) {
    app.component(key, component)
  }
}
registerComponent(ElementPlusIconsVue) // element Icon 图标
const globalComponentMap = {
  Icon: Icon, // 自定义 Icon 组件
  Search: Search, // 搜索栏
  CommonTable: CommonTable // 表格（分页和虚拟列表）
}
registerComponent(globalComponentMap)

app
  .use(pinia)
  .use(router)
  .use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn })
  .use(VueVirtualScroller)
  .mount('#app')
