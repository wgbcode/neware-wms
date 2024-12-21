<template>
  <ul class="c-flex-ycenter">
    <li v-for="(item, index) in newData" :key="index" class="c-flex-center">
      <span class="c-fs12 c-mr2" :style="{ color: item.nameColor }">{{ item.name }}</span>
      <el-tooltip
        popper-class="custom-tooltip-popper"
        v-if="index !== 0 && index + 1 !== newData.length && item.info.length > 0 && item.info[0].name"
        raw-content
      >
        <Icon name="btn-question" size="14" color="#808080" />
        <template #content>
          <div class="c-flex-column c-p5">
            <h2 class="c-mb6 c-fw700 c-fs16" :style="{ color: 'var(--tc-primary-text)' }">{{ item.name }}</h2>
            <ul class="c-flex-ycenter">
              <li class="c-mr15 c-fs14" :style="{ color: 'var(--tc-primary-text)' }">{{ item.time }}</li>
              <li class="c-flex-column-start c-mr25 c-fs14">
                <span v-for="(_item, index) in item.info" :key="index" class="c-m2" :style="{ color: 'var(--tc-primary-text)' }">
                  {{ _item.name }}
                </span>
              </li>
              <li class="c-flex-column-start c-fs14">
                <span v-for="(_item, index) in item.info" :key="index" :style="{ color: _item.statusColor }" class="c-m2">
                  {{ _item.statusName }}
                </span>
              </li>
            </ul>
          </div>
        </template>
      </el-tooltip>
      <div v-if="index + 1 !== newData.length" class="c-flex-column c-flex-center">
        <span class="c-fs12 c-h15" style="color: #c1c1c1; scale: 0.8">{{ item.nextIntervalTime }}</span>
        <i class="c-h1 c-w100p" style="background-color: #c1c1c1; scale: 0.9; display: inline-block; min-width: 110px" />
        <span class="c-fs12 c-h15" style="color: #c1c1c1; scale: 0.8">{{ item.time }}</span>
      </div>
    </li>
  </ul>
</template>

<script setup lang="tsx">
import { computed, type PropType } from 'vue'

type FieldInfoMap = {
  infoName: string
  infoStatus: string
}
type FieldMap = {
  name: string
  status: string
  time: string
  intervalTime: string
  info: string
  infoFieldMap: FieldInfoMap
}
type ProcessBarInfoData = {
  name: string
  statusColor: string
  statusName: string
}
type ProcessBarData = {
  name: string
  nameColor: string
  time: string
  nextIntervalTime: string
  info: ProcessBarInfoData[]
}

const props = defineProps({
  data: {
    type: Array<AnyObject>,
    required: true
  },
  // 字段名映射
  fieldMap: {
    type: Object as PropType<FieldMap>,
    default: () => {
      return {
        name: 'name',
        status: 'status',
        time: 'time',
        intervalTime: 'intervalTime',
        info: 'info',
        infoFieldMap: { infoName: 'name', infoStatus: 'status' }
      }
    }
  },
  // 审批状态映射
  statusMap: {
    type: Object as PropType<Record<'pending' | 'agree' | 'reject', number>>,
    default: () => {
      return {
        pending: 0, // 未决
        agree: 1, // 同意
        reject: 2 // 驳回
      }
    }
  }
})
const newData = computed<ProcessBarData[]>(() => {
  const { name, status, time, intervalTime, info, infoFieldMap } = props.fieldMap
  const { infoName, infoStatus } = infoFieldMap
  return props.data.reduce<ProcessBarData[]>((pre, next, index, array) => {
    pre.push({
      name: next[name] ?? '',
      nameColor: getStatusMapItem(next[status]).color,
      time: next[time] ?? '',
      nextIntervalTime: array[index + 1]?.[intervalTime] ?? '',
      info: next[info].map((item: AnyObject) => {
        return {
          name: item[infoName] ?? 0,
          statusColor: getStatusMapItem(item[infoStatus]).color,
          statusName: getStatusMapItem(item[infoStatus]).infoStatusName
        }
      })
    })
    return pre
  }, [])
})
interface StatusMapValue {
  color: string
  infoStatusName: string
}
const statusMapInfo: Record<string, StatusMapValue> = {
  pending: { color: '#F8B500', infoStatusName: '未审批' }, // 未决
  agree: { color: '#34A853', infoStatusName: '通过' }, // 同意
  reject: { color: '#EA4335', infoStatusName: '驳回' } // 驳回
}
function getStatusMapItem(status: number | null) {
  let item = { color: '#6A6D70', infoStatusName: '' }
  if (status || status === 0) {
    for (let [key, value] of Object.entries(props.statusMap)) {
      if (value === status) {
        item = statusMapInfo[key]
        break
      }
    }
  }
  return item
}
</script>
