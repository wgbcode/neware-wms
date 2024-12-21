import { appStore } from '@/stores/app'
interface MessageInfo {
  verifyInfo: string
  origin: string
  instance: MessageEventSource
  data: any
}

// 页面实例和初始化信息
let messageInfo: null | MessageInfo
// 回传信息
const postMessage = (backVerifyInfo: string, data?: any) => {
  if (messageInfo) {
    const { verifyInfo, origin, instance } = messageInfo
    // 加强校验，统一给 verifyInfo 加前缀
    instance.postMessage({ verifyInfo: `${verifyInfo}-${backVerifyInfo}`, data }, { targetOrigin: origin })
  }
}
// 使用 postMessag 实现跨系统通讯
const useMessage = (verifyInfo: string) => {
  // 实例不存在且需要跨系统通讯时才执行
  if (!messageInfo && appStore.isOnlyShowMain) {
    const postOrigin = [
      'http://erp.neware.com.cn',
      'https://erp.neware.com.cn',
      'http://bi.neware.work',
      'https://bi.neware.work',
      'http://192.168.0.214', // 测试环境
      'http://dev-test-123.natapp1.cc' // 内网穿透
    ]
    // 本地环境
    const localRegex1 = /^http:\/\/localhost:\d{1,4}$/ // 匹配所有 http://localhost:* 端口本地环境
    const localRegex2 = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d{1,4}$/ // 匹配所有 http://192.168.*.*:* 端口本地环境
    const handlerFn = (e: MessageEvent) => {
      const { origin, data, source } = e
      const isMatch = data.verifyInfo === verifyInfo && (postOrigin.includes(origin) || localRegex1.test(origin) || localRegex2.test(origin))
      // debugger
      if (isMatch) {
        // 获取页面实例和初始化信息，并关闭本页面的定时器、监听器
        messageInfo = { verifyInfo, origin: origin, instance: source!, data: data.data }
        // 关闭另一页面的定时器
        postMessage('clearInterval')
      }
    }
    // 接收发过来的消息，并保存页面实例、源页面地址、初始化数据
    window.addEventListener('message', handlerFn)
    // postMessage 成功连接后执行
    afterMessageConnect(() => window.removeEventListener('message', handlerFn))
  }
}
function afterMessageConnect(callBack: Function) {
  // 判断是否从 BI 打开，不从 BI 打开不会用到 postMessage
  if (appStore.isOnlyShowMain) {
    let timer: null | NodeJS.Timeout = setInterval(() => {
      if (messageInfo) {
        callBack()
        timer && clearInterval(timer)
        timer = null
      }
    }, 200)
  } else {
    callBack()
  }
}
export { messageInfo, useMessage, postMessage, afterMessageConnect }
