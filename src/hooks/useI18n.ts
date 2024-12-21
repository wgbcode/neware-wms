import { createI18n } from 'vue-i18n'

const zh = {
  message: {
    hello: '你好，世界',
    btnTest: '切换语言'
  }
}
const en = {
  message: {
    hello: 'hello world',
    btnTest: 'SwitchLang'
  }
}

const option = {
  locale: 'zh', // 当前语言
  legacy: false, // 使用 Composition API 模式，需设置为 false
  globalInjectiontrue: true, // 全局注入 $t 函数
  messages: { zh, en }
}

// 系统国际化参数配置
export const i18n = createI18n(option)
