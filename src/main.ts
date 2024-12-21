import '@/styles/main.css'
import { defineAsyncComponent, type AsyncComponentLoader, type Component } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import { app } from '@/stores/auth'
import router from './router'
import print from 'vue3-print-nb'
import { i18n } from '@/hooks/useI18n'
import permission from '@/directives/permission'
import clickoutside from '@/directives/clickoutside'
import CommonSearch from '@/components/global/staticImport/search/index.vue'
import CommonTable from '@/components/global/staticImport/table/index.vue'
import CommonPagination from '@/components/global/staticImport/pagination/index.vue'
import CommonAGTable from '@/components/global/staticImport/agTable/index.vue'
import CommonFooter from '@/components/global/staticImport/footer/index.vue'
import 'virtual:svg-icons-register'
import '@/permission'

// 注册全局指令
app.directive('permission', permission)
app.directive('clickoutside', clickoutside)

// 手动注册全局组件，防止项目初始化时白屏
const staticGlobalComp: Record<string, Component> = {
  'c-table': CommonTable,
  'c-search': CommonSearch,
  'c-pagination': CommonPagination,
  'c-ag-table': CommonAGTable,
  'c-footer': CommonFooter
}
for (const key in staticGlobalComp) {
  app.component(key, staticGlobalComp[key])
}

// 自动注册全局组件。global 中的文件夹需以小驼峰形式命名
const components: Record<string, AsyncComponentLoader> = import.meta.glob('@/components/global/dynamicImport/*/index.vue')
for (const [key, value] of Object.entries(components)) {
  const fileName = key
    .replace('/src/components/global/dynamicImport/', '')
    .replace('/index.vue', '')
    .replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())
  // 自定义组件名，否则默认加前缀 "c-"
  const customMap: Record<string, string> = {
    icon: 'Icon',
    'link-cell': 'LinkCell',
    'link-user': 'LinkUser',
    'file-viewer': 'FileViewer'
  }
  const componentName = customMap[fileName] ?? 'c-' + fileName
  app.component(componentName, defineAsyncComponent(value))
}

app.use(print).use(i18n).use(router).use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn }).mount('#app')
