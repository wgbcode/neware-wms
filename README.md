## Project Introduce

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
 |-- globalTypes.ts
 |-- index.html
 |-- src
    |-- main.ts
    |-- App.vue
 	|-- api 接口管理
 	|-- assets 图片等资源
 	|-- directive 指令
 	|-- filter 过滤器
	|-- router 路由
    |-- stores 全局状态管理
	|-- styles 全局样式
	|-- utils 工具方法
    |-- components 公共组件
	|-- views 视图
		|-- error 错误页
        |-- login 登录页
		|-- layout 布局容器
		|-- accountCenter 账号中心
		|-- orderMange 订单管理
	|-- permission.ts 路由权限控制
```

## 项目安装

```
yarn install
```

### 本地环境(本地开发用的配置文件.env.dev | .env.dev.local)

```
yarn dev
yarn devl
```

### 生产环境(打包到生产环境测试的配置文件 .evn.prod)

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

### git 提交规范

```
1. git add <file>
2. git commit -m <message>
3. git push origin <remote branch>
```
