<template>
  <div>
    <h1>{{ $t('message.hello') }}</h1>
    <el-button type="primary" @click="toggleLang">{{ $t('message.btnTest') }}</el-button>
  </div>
</template>

<script setup lang="tsx">
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const toggleLang = () => (locale.value = locale.value === 'zh' ? 'en' : 'zh')
</script>
