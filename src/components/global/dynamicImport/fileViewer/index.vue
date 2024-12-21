<template>
  <div>
    <div class="file-viewer" v-if="fileViewerVisible">
      <div class="image-viewer-container">
        <img :src="currentFile.url" />
      </div>
      <div class="viewer-btn btn-close" @click="handleClose">
        <Icon name="btn-close" size="20px" class="c-mr2" />
      </div>
      <div class="viewer-btn btn-prev" @click="handlePrev">
        <Icon name="btn-prev-step" size="20px" class="c-mr2" />
      </div>
      <div class="viewer-btn btn-next" @click="handleNext">
        <Icon name="btn-next-step" size="20px" class="c-mr2" />
      </div>
      <div class="viewer-btn-list">
        <div @click="handleDownLoadFile"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getToken } from '@/utils/auth'
import { ref, shallowRef, computed } from 'vue'
const XToken = getToken()
const fileViewerVisible = shallowRef<boolean>(false)
const viewerIndex = shallowRef<number>(0)
const previewFileList = ref<AnyObject[]>([]) // 预览文件列表
function open(fileList: AnyObject[]) {
  let tempList = fileList
  tempList = tempList
    .filter((item) => item.id)
    .map((item) => {
      return {
        ...item,
        url: `${import.meta.env.VITE_BASE_URL}/files/DownloadAllow/${item.id}?X-Token=${XToken}`
      }
    })
  fileViewerVisible.value = true
  previewFileList.value = tempList
}
defineExpose({ open })
function handleClose() {
  fileViewerVisible.value = false
  previewFileList.value = []
}
function handleNext() {
  let num = viewerIndex.value + 1
  if (num > previewFileList.value.length - 1) {
    num = 0
  }
  viewerIndex.value = num
}
function handlePrev() {
  let num = viewerIndex.value - 1
  if (num < 0) {
    num = previewFileList.value.length - 1
  }
  viewerIndex.value = num
}
const currentFile = computed(() => {
  return previewFileList.value[viewerIndex.value]
})
// 下载文件
function handleDownLoadFile() {
  if (currentFile.value.url) {
    window.open(currentFile.value.url, '_blank')
  } else {
    const url = `${import.meta.env.VITE_BASE_URL}/files/DownloadAllow/${currentFile.value.id}?X-Token=${XToken}`
    window.open(url, '_blank')
  }
}
</script>
<style lang="scss" scoped>
.file-viewer {
  position: fixed;
  background-color: #000000a8;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 9999;
  .image-viewer-container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      user-select: none;
    }
  }
}
.viewer-btn {
  position: fixed;
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: 20px;
  background: #9f9f9f;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: #cccccc;
  }
  &.btn-close {
    top: 15px;
    right: 15px;
  }
  &.btn-prev {
    left: 15px;
    top: 400px;
  }
  &.btn-next {
    right: 15px;
    top: 400px;
  }
}
.viewer-btn-list {
  position: fixed;
  width: 200px;
  height: 40px;
  border-radius: 20px;
  bottom: 15px;
  right: 400px;
}
</style>
