<template>
  <div class="c-h100p c-relative">
    <section class="c-absolute c-t60 c-l50">
      <img src="@images/logo.png" alt="" />
    </section>
    <section class="login c-absolute-center c-w312 c-p30 c-br5">
      <ul class="c-mb12 c-flex-ycenter">
        <li class="c-fw700 c-fs18 c-mr5">WMS 5.0.0</li>
        <li class="c-fs14 c-opacity4">(2023.08.10)</li>
      </ul>
      <el-input v-model="username" placeholder="账号" class="c-mb12" />
      <el-input v-model="password" type="password" placeholder="密码" show-password class="c-mb12" />
      <div class="c-mb12">
        <el-input v-model="imageCode" placeholder="验证码" />
      </div>
      <el-button type="warning" class="c-w100p" size="large" @click="userLogin(false)">登录</el-button>
    </section>
    <section class="c-absolute-xcenter c-b40 c-fs12 c-flex-ycenter">
      <ul class="c-flex-ycenter">
        <li>©</li>
        <li class="c-mx8 c-mt2"><img class="c-mx3 c-h11" src="@images/logo-word.png" alt="" /></li>
        <li>1998-2023</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { login } from '@/api/user'

const username = ref<string>('')
const password = ref<string>('')
const imageCode = ref<string>('')

// 登录
const router = useRouter()
const userLogin = (isQRCode: boolean) => {
  if (!isQRCode) {
    const params = { username: username.value ?? '', password: password.value ?? '' }
    login(params)
      .then(res => {
        console.log('res', res)
        if (res.data.code === 0) {
          ElMessage({
            message: '登录成功',
            type: 'success',
          })
          router.push({ path: '/layout' })
        } else {
          ElMessage.error('登录失败')
        }
      })
  }
}
</script>

<style scoped lang="scss">
.login {
  background-color: white;
}
</style>
@/api/user