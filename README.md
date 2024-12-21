# WMS_Sutongy

## 项目介绍
+ 前端公共框架

## 迁移时间 
+ 2024.08.05 11:30:00

## 项目结构

```
|-- neware-wms
 |-- vite.config.ts
 |-- tsconfig.json
 |-- tsconfig.app.json
 |-- tsconfig.node.json
 |-- package.json
 |-- .prettierrc.json
 |-- .eslintrc.cjs
 |-- .eslintignore
 |-- .gitignore
 |-- .env.dev
 |-- .env.dev.local(本地创建)
 |-- .env.pro
 |-- env.d.ts
 |-- custom.d.ts 全局自定义公共类型
 |-- deploy.sh 自定化部署脚本（待完善）
 |-- index.html
 |-- src
 	|-- App.vue
 	|-- main.ts
	|-- permission.ts 路由权限控制
 	|-- api 接口管理
 	|-- assets 图片等资源
 	|-- directive 指令
		|-- permission.ts 权限按钮
		|-- clickoutside.ts 侦听元素外部点击
	|-- hooks 钩子
		|-- useI18n.ts 国际化
		|-- useExcel.ts 导出 Excel 
		|-- useMessage.ts postMessage 跨系统通讯
		|-- useVModel.ts 3.4 版本后使用 defineModel 代替
	|-- router 路由
	|-- stores 全局状态管理
	|-- styles 全局样式
		|-- custom-base.scss 全局自定义公共类名（c 开头）
		|-- custom-global.scss 全局自定义公共类名（非 c 开头）
	|-- utils 工具方法
		|-- request.ts axios 封装
		|-- common.ts 部分常用公共方法
		|-- format.ts 数字、时间、日期等格式化
		|-- generateRoutes.ts 配置 keep-alive
	|-- components 公共组件
	|-- views 视图
		|-- error 错误页
		|-- login 登录页
		|-- layout 布局容器
		|-- accountCenter 账号中心
		|-- orderMange 订单管理
		|-- selectCompany 选择公司
		|-- system 系统配置
		|-- categories 字典配置
		|-- moduleManager 模块配置（菜单）
		|-- orgManager 部门配置
		|-- roleManager 角色配置
		|-- userManager 用户配置
		|-- test 测试 DEMO
		|-- serve 服务 CS
		|-- supplyChain 供应链 SCM	
		|-- finance 财务 FICO	
```

## 项目安装

#### 安装
```
npm install -g yarn
yarn install
```

#### Yarn 配置淘宝镜像

```
yarn config get registry
yarn config set registry https://registry.npmmirror.com/  
```

#### 本地环境
```
yarn dev
```

#### 生产环境
```
yarn build
```

#### 项目自动部署
```
yarn deploy // 终端需使用 Git Bash
```

#### git 提交规范
```
1. git add <file>
2. git commit -m <message>
3. git pull origin <remote branch> --rebase
4. git push origin <remote branch>
```

#### 注意事项
```
1. 需安装插件：Vue-Official、ESlint、Prettier
2. 需禁用插件：Vetur、Volar
3. node 版本：18+
```

