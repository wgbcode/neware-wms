/// <reference types="vite/client" />

declare module 'element-plus/dist/locale/zh-cn.mjs'

declare module 'js-cookie'

declare module 'vue-virtual-scroller'

declare module 'qrcodejs2-fix'

declare module 'vue3-print-nb'

declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '@wangeditor/editor'

declare module '@wangeditor/editor-for-vue'
