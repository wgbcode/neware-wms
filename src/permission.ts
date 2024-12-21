import router from '@/router'
import { authStore, type ModuleTree } from '@/stores/auth'
import { appStore } from '@/stores/app'
import { getToken } from '@/utils/auth'
import * as authApi from '@/api/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { ElMessage } from 'element-plus'
import { generateRoutes } from '@/utils/generateRoutes'

// 配置全局前置守卫
router.beforeEach(async (to) => {
  NProgress.start()

  // 路径中有 token 时，保存 token
  const queryToken = to.query['token'] as string
  if (queryToken) {
    // token 保存到全局
    authStore.setToken(queryToken)
    // 通过路径登录时，只展示内容区域，隐藏顶栏、侧边栏和 Tab 栏
    appStore.saveIsOnlyShowMain(true)
  } else {
    // 删除全局中的 token
    authStore.removeToken()
  }

  // token 存在
  const token = authStore.token || getToken()
  const isExitRouter = router.getRoutes().find((i) => i.name === 'layout')
  if (token && !isExitRouter && to.name !== 'login') {
    let modulesTree: ModuleTree[] | null = null
    if (!modulesTree) {
      try {
        const res = await authApi.GetModulesTree({ token }) // 获取路由信息
        const { code, result } = res
        code === 200 && (modulesTree = result)
      } catch (error) {
        ElMessage({ type: 'error', message: `${error}` })
        router.push({ name: 'login' }) // token 失效后重新跳转到登录页
      }
    }
    if (!authStore.userInfo) {
      // 获取用户所有信息
      const res = await authApi.GetUserAll()
      const { code, data } = res
      code === 200 && authStore.saveUserInfo(data)
    }
    // 获取所有用户的基本信息
    if (!authStore.allUserList?.length) {
      const res = await authApi.GetAllUserInfo()
      const { code, data } = res
      code === 200 && authStore.setAllUserList(data)
    }
    if (modulesTree) {
      const willAddRoute = generateRoutes(modulesTree)
      router.addRoute(willAddRoute) // 动态加载路由
      router.push({ ...to, replace: true })
    }
  }

  // 重定向到登录页面，且避免无限重定向
  if (!token && to.name !== 'login') {
    return { name: 'login' }
  }
})

// 配置全局后置守卫
router.afterEach((_to, _from) => NProgress.done())
