<template>
  <div class="c-h100p c-relative">
    <div class="c-absolute c-t60 c-l50">
      <img src="@images/logo.png" alt="" />
    </div>
    <div class="login c-absolute-center c-w312 c-p30 c-br5">
      <ul class="c-mb12 c-flex-ycenter">
        <li class="c-fw700 c-fs18 c-mr5">WMS 5.0.0</li>
        <li class="c-fs14 c-opacity4">(2023.08.10)</li>
      </ul>
      <div>
        <el-input v-model="userName" placeholder="账号" class="c-mb12" />
        <el-input v-model="password" type="password" placeholder="密码" show-password class="c-mb12" />
        <div class="c-mb12">
          <el-input v-model="imageCode" placeholder="验证码" />
        </div>
        <el-button type="warning" class="c-w100p" size="large" @click="userLogin">登录</el-button>
      </div>
    </div>
    <div class="c-absolute-xcenter c-b40 c-fs12 c-flex-ycenter">
      <ul class="c-flex-ycenter">
        <li>©</li>
        <li class="c-mx8 c-mt2"><img class="c-mx3 c-h11" src="@images/logo-word.png" alt="" /></li>
        <li>1998-2023</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const userName = ref('')
const password = ref('')
const imageCode = ref('')

const router = useRouter()
const userLogin = () => {
  router.push({
    path: '/layout',
  })
}
</script>

<style scoped lang="scss">
.login {
  background-color: white;
}
</style>
