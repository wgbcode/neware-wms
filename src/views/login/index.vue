<template>
  <div class="c-h100p c-relative">
    <section class="c-absolute c-t60 c-l50">
      <div class="c-relative">
        <i class="c-absolute c-h50 c-w50 c-l0 c-t0" @click="toggleLoginStyle"></i>
        <img src="@images/logo.png" alt="" />
      </div>
    </section>
    <section class="login c-absolute-center c-w312 c-p30 c-br5">
      <div v-if="!isQRCode">
        <ul class="c-mb12 c-flex-ycenter">
          <li class="c-fw700 c-fs18 c-mr5">NewAre</li>
          <li class="c-fs14 c-opacity4"></li>
        </ul>
        <el-input v-model="username" placeholder="账号" class="c-mb12" />
        <el-input v-model="password" type="password" placeholder="密码" show-password class="c-mb12" />
        <div class="c-mb12 c-flex-between" v-show="loginCount === 1 ? false : true">
          <el-input v-model="userImageCode" placeholder="验证码" />
          <input type="button" class="imgCode" @click="createImgCode" v-model="imageCode" />
        </div>
        <el-button :loading="loginLoading" type="warning" class="c-w100p" size="large" @click="userLogin()">登录</el-button>
      </div>
      <div v-else>
        <ul class="c-mb12 c-flex-ycenter">
          <li class="c-fw700 c-fs24 c-ml20">NewAre</li>
          <li class="c-fs14 c-opacity4 c-mt6"></li>
        </ul>
        <div class="c-flex-center c-mb12 c-relative c-h165">
          <img v-show="qrCodeURL" :src="qrCodeURL" class="c-w180" alt="" />
          <p v-show="!qrCodeURL" class="c-w180 c-h180" v-loading="true"></p>
          <p class="expireInfo c-absolute c-w180 c-h180 c-flex-center" v-show="isExpireQRCode && qrCodeURL" @click="toggleShade">
            二维码失效，点击刷新
          </p>
        </div>
        <ul class="c-flex-center c-fs14">
          <li>请使用</li>
          <li class="qrcodeTip c-fw700">新威智能</li>
          <li>扫描二维码登录</li>
        </ul>
      </div>
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
import router from '@/router'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Login, GetLoginQRCode, ValidateLogin } from '@/api/auth'
import { setToken } from '@/utils/auth'
import { authStore } from '@/stores/auth'
import { useDark } from '@vueuse/core'

const loginCount = ref<number>(1)
const isQRCode = ref<boolean>(true)
const isExpireQRCode = ref<boolean>(false)
const qrCodeURL = ref<string>('')
const pollCount = ref<number>(0)
const pollTimer = ref<null | NodeJS.Timeout>(null)

// 开启或关闭二维码遮罩
const toggleShade = () => (isExpireQRCode.value = !isExpireQRCode.value)

// 获取登录二维码
const getQRCode = () => {
  if (isQRCode.value) {
    isExpireQRCode.value = true
    GetLoginQRCode().then((res) => {
      const { result, code } = res
      if (code === 200) {
        const { img, codeId } = result
        qrCodeURL.value = img
        isExpireQRCode.value = false
        // 轮询校验用户扫码情况
        pollCount.value = 0
        clearPollTimer()
        pollTimer.value = setInterval(async () => {
          try {
            await ValidateLogin({ codeId: codeId }).then((res) => {
              const { code, result } = res
              if (code === 200) {
                setToken(result.erpToken)
                authStore.setToken(result.erpToken)
                clearPollTimer()
                pollTimer.value = null
                router.push({ path: '/selectCompany' })
                pollCount.value = 0
              }
            })
            pollCount.value++
            if (pollCount.value >= 180) {
              clearPollTimer()
              pollTimer.value = null
              toggleShade()
              pollCount.value = 0
            }
          } catch (_err) {
            clearPollTimer()
            pollTimer.value = null
          }
        }, 1000)
      }
    })
  }
}

// 切换登录方式
const toggleLoginStyle = () => {
  clearPollTimer()
  isQRCode.value = !isQRCode.value
  getQRCode()
}

// 生成图片校验码
const imageCode = ref<string>('')
const userImageCode = ref<string>('')
const createImgCode = () => {
  const codeLength = 4
  const randomArr = [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ]
  imageCode.value = ''
  for (let i = 0; i < codeLength; i++) {
    const index = Math.floor(Math.random() * 36)
    imageCode.value += randomArr[index]
  }
}
const validateImageCode = () => {
  let msg = ''
  const curImageCode = userImageCode.value.toUpperCase()
  switch (true) {
    case curImageCode.length <= 0:
      msg = '请输入验证码'
      break
    case curImageCode != imageCode.value.toUpperCase():
      msg = '验证码输入错误'
      createImgCode()
      break
  }
  return msg ? (ElMessage.error(msg), false) : true
}

// 登录
const username = ref<string>('')
const password = ref<string>('')
const loginLoading = ref<boolean>(false)
const userLogin = () => {
  const valImageCode = loginCount.value !== 1 ? validateImageCode() : true
  if (!isQRCode.value && valImageCode) {
    clearPollTimer()
    const params = {
      Account: username.value ?? '',
      Password: password.value ?? '',
      AppKey: 'openauth',
      from: 'browser'
    }
    loginLoading.value = true
    Login(params)
      .then((res) => {
        const { code, token } = res
        if (code === 200) {
          setToken(token)
          authStore.setToken(token)
          router.push({ path: '/selectCompany' })
          clearPollTimer()
        } else {
          loginCount.value++
          createImgCode()
        }
      })
      .finally(() => (loginLoading.value = false))
  }
  if (isQRCode.value) {
    console.log('扫码登录')
  }
}
function clearPollTimer() {
  pollTimer.value && clearInterval(pollTimer.value)
}

onMounted(() => {
  getQRCode()
  loginCount.value !== 1 && !isQRCode.value && createImgCode()
  const isLight = localStorage.getItem('vueuse-color-scheme') === 'light'
  !isLight && useDark({ valueDark: 'dark', valueLight: 'light' })
})
</script>

<style scoped lang="scss">
.login {
  background-color: var(--tc-content-dialogd);

  .qrcodeTip {
    color: var(--tc-brand);
  }

  .expireInfo {
    color: white;
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.imgCode {
  font-family: Arial, 宋体;
  font-style: italic;
  color: burlywood;
  border: 0;
  padding: 2px 3px;
  letter-spacing: 5px;
  font-weight: bolder;
  margin-left: 5px;
  border-radius: 2px;
  min-width: 80px;
  max-width: 80px;
  height: 25px;

  &:hover {
    cursor: pointer;
  }
}
</style>
