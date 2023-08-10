import './styles/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/global/SvgIcon.vue'

const app = createApp(App)

// 全局注册 element Icon 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 自定义 Icon 组件
app.component('SvgIcon', SvgIcon)

app.use(createPinia()).use(router).use(ElementPlus, { size: 'small', zIndex: 3000 }).mount('#app')
