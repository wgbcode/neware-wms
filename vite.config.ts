/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
import viteCompression from 'vite-plugin-compression'
import { loadEnv } from 'vite' // 加载环境变量
import eslintPlugin from '@nabla/vite-plugin-eslint'
import commonjs from 'vite-plugin-commonjs'
// import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }: Record<string, string>) => {
  return defineConfig({
    base: loadEnv(mode, process.cwd()).VITE_STATIC_URL,
    plugins: [
      commonjs(),
      vue(),
      vueJsx(),
      eslintPlugin(),
      createSvgIconsPlugin({
        iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
        symbolId: 'icon-[dir]-[name]',
        svgoOptions: {
          plugins: [
            {
              name: 'removeAttrs',
              params: { attrs: ['class', 'data-name', 'fill', 'stroke'] }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.join(__dirname, './src'),
        '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url))
      }
    },
    css: {
      devSourcemap: true
    },
    server: {
      host: true,
      port: 3000,
      open: false,
      hmr: { overlay: true, protocol: 'ws', host: 'localhost' },
      proxy: {
        '/api': {
          target: loadEnv(mode, process.cwd()).VITE_CORS_TARGET_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      sourcemap: false, // 需要线上调试时设置成 true
      chunkSizeWarningLimit: 4000,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        plugins: [
          // 文件压缩
          viteCompression({
            verbose: true,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
            ext: '.gz',
            deleteOriginFile: true
          })
          // 代码体积分析
          // visualizer({ open: true })
        ],
        output: {
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : []
            const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'
            return `js/${fileName}/[name]-[hash].js`
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor-' + id.toString().split('node_modules/')[1].split('/')[0].toString()
            }
          }
        },
        onwarn(warning, rollupWarn) {
          // 无效注释的警告不抛出
          if (warning.code === 'INVALID_ANNOTATION') {
            return
          }
          rollupWarn(warning)
        }
      }
    },
    test: {
      environment: 'happy-dom',
      coverage: {
        provider: 'v8'
      }
    }
  })
}
