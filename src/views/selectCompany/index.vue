<template>
  <div class="c-flex-center c-flex-column-1 c-h100p">
    <section class="c-h20p">
      <Icon name="select-company1" size="180" color="var(--tc-global-yellow)" stroke="var(--tc-global-yellow)" />
    </section>
    <section class="c-h40p c-flex-yend">
      <div class="c-w450 c-h200 c-br4 c-py32 c-px64" style="background-color: #3d3d3d">
        <div class="c-flex-center">
          <Icon name="select-company2" color="white" size="30" />
          <span class="c-fs22 c-ml3">选择公司</span>
        </div>
        <div class="c-flex-ycenter">
          <el-select class="c-w100p c-py20" v-model="indicate" placeholder="Select" size="small" style="width: 100%">
            <el-option v-for="item in indicateList" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <el-button :loading="btnLoading" style="width: 100%" type="warning" @click="submitIndicate">登录</el-button>
      </div>
    </section>
    <section class="c-h40p c-flex-between c-flex-column-1 c-pb20 c-pt5">
      <span @click="backLogin" style="text-decoration: underline; cursor: pointer">返回重新登录</span>
      <ul class="c-flex-ycenter">
        <li>©</li>
        <li class="c-mx8 c-mt2">
          <img class="c-mx3 c-h11" src="@images/logo-word.png" alt="" />
        </li>
        <li>1998-2023</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="tsx">
import router from '@/router'
import { shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { GetIndeiCateList, SubmitIndicate } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { authStore } from '@/stores/auth'

const indicate = shallowRef()
const indicateList = shallowRef<Record<string, string>[]>([])

const getIndeiCateList = () => {
  GetIndeiCateList({ account: authStore.userInfo?.account }).then((res) => {
    const { code, result } = res
    if (code === 200) {
      const { currentIndicator, loginIndicateList } = result
      indicate.value = currentIndicator
      indicateList.value = loginIndicateList.map((i: Record<string, string>) => ({
        value: i.value,
        label: i.name
      }))
    }
  })
}
let timer: null | NodeJS.Timeout = setInterval(() => {
  const account = authStore.userInfo?.account
  if (account) {
    getIndeiCateList()
    timer && clearInterval(timer)
    timer = null
  }
}, 100)

const btnLoading = shallowRef(false)
const submitIndicate = () => {
  if (indicateList.value.length > 0) {
    btnLoading.value = true
    SubmitIndicate({ indicateCode: indicate.value })
      .then((res) => {
        const { code } = res
        code === 200 && router.push({ path: '/layout' })
      })
      .finally(() => (btnLoading.value = false))
  } else {
    ElMessage({ type: 'warning', message: '标识列表正在加载，请稍候' })
  }
}

const backLogin = () => router.push({ path: '/login' })

// 返回时直接回退到登录页
const popstateHandler = () => router.push({ path: '/login' })
onMounted(() => window.addEventListener('popstate', popstateHandler, false))
onBeforeUnmount(() => window.removeEventListener('popstate', popstateHandler, false))
</script>
