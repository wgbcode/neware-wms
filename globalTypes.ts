// 路由配置
export interface RouterConfig {
  path: string
  name: string
  meta: {
    title: string
    icon: string
    hidden: boolean
  }
  component: () => Promise<any>
}
