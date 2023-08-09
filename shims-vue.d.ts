// 让 ts 能识别 vue 文件
declare module '*.vue' {
  import { ComponentOptions } from 'vue'
  const component: ComponentOptions
  export default component
}
