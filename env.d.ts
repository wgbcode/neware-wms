/// <reference types="vite/client" />

declare module 'element-plus/dist/locale/zh-cn.mjs'

declare module 'js-cookie'

// 让 ts 能识别 vue 文件
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
