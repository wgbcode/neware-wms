<template>
  <div class="c-relative">
    <div class="c-flex-column c-h100p">
      <div class="custom-search">
        <c-search v-model:data="queryList" :config="searchConfig" />
        <el-dropdown :hide-on-click="false" style="height: 20px" @command="handleDropdownClick">
          <MyButton type="warning" iconName="btn-plus" iconColor="transparent" iconStroke="#000" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="培训计划">培训计划</el-dropdown-item>
              <el-dropdown-item command="培训通知">培训通知</el-dropdown-item>
              <el-dropdown-item command="必修课">课程</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <c-table ref="tableRef" v-model:data="tableData" :tableConfig="tableConfig" :columnsConfig="columnsConfig" class="c-flex-1" v-loading="loading">
        <!-- 流水号 -->
        <template #globalApprovalId="row">
          <link-cell :text="row.globalApprovalId"></link-cell>
        </template>
        <!-- 单据编号 -->
        <template #id="row">
          <link-cell :text="getKBText(row.id)"></link-cell>
        </template>
        <!-- 来源 -->
        <template #trainType="row">
          {{ row.type === 1 ? '创建培训计划' : getDicText(typeList, row.trainType) }}
        </template>
        <!-- 类型 -->
        <template #trainModeHeader="{ column }">
          <el-tooltip effect="dark" placement="top-start" class="tooltip">
            <template #content>
              <div>新入职包括：企业文化、组织架构、安全生产、岗位所需技能等类型的培训;</div>
              <div>业务知识包括：公司系统操作与流程、各系列产品软硬件功能及使用介绍等与产品业务相关联的培训;</div>
              <div>技能提升包括：案例分享、沟通技巧、有助于岗位所需的技能进一步提升类的培训;</div>
              <div>管理能力包括：对管理层人员领导力、团队建设、战略规划等技能提升的培训。</div>
            </template>
            <div>
              {{ column.label }}
              <img src="@/assets/images/question.svg" alt="" />
            </div>
          </el-tooltip>
        </template>
        <!-- 适用岗位 -->
        <template #trainCharacter="row">
          {{ getDicText(characterList, row.trainCharacter) }}
        </template>
        <!-- 培训主题 -->
        <template #trainTheme="row">
          <link-cell :text="row.trainTheme" v-on:click="() => {}"></link-cell>
        </template>
        <!-- 主讲人 -->
        <template #speaker="row">
          <link-user :userId="row.speakerUserId" :text="row.speaker"></link-user>
        </template>
        <!-- 总时长 -->
        <template #duration="row">
          <div v-if="row.type !== 1">{{ row.duration.text }}</div>
        </template>
        <!-- 签到二维码 -->
        <template #qrcode="row">
          <link-cell v-on:click="openQrcoDialog(row)" v-if="row.type !== 1">
            <template #text>
              <img class="pointer" :src="iconQrcode" alt="SVG Icon" />
            </template>
          </link-cell>
        </template>
        <!-- 要求参训人数 -->
        <template #trainTraget="row">
          <link-cell v-if="row.type !== 1" style="float: right" v-on:click="openTargetAttendees(row)" :text="row.trainTraget"></link-cell>
        </template>
        <!-- 实际参训人数 -->
        <template #trainNum="row">
          <link-cell v-if="row.type !== 1" style="float: right" v-on:click="openActualAttendees(row)" :text="row.trainNum || '0'"></link-cell>
        </template>
        <!-- 创建人 -->
        <template #createUser="row">
          <link-user :userId="row.createUserId" :text="row.createUser"></link-user>
        </template>
        <!-- 状态 -->
        <template #status="row">
          <div v-if="row.isCancel" class="redWord">已取消</div>
        </template>
        <!-- 操作 -->
        <template #oper="row">
          <div class="opration" v-if="(!row.isCancel && isOverTime(row) && isAuth(row)) || (!row.isCancel && row.type == 1 && isAuth(row))">
            <div class="pointer edit" @click="handleMeetingEdit(row)">
              <img :src="iconEdit" alt="SVG Icon" />
            </div>
            <div class="pointer delete" @click="handleMeetingDelete(row)">
              <img :src="iconDelete" alt="SVG Icon" />
            </div>
          </div>
        </template>
      </c-table>
      <c-pagination class="pageination"  v-model:data="pagData" @change="onSearch" @datetimeChange="onDateChange" :isShowDatePicker="true">
        <template #content>
          <div class="c-relative c-w16 c-h20">
            <el-tooltip effect="dark" placement="top-start" class="tooltip">
              <template #content>
                <div>以创建时间查询</div>
              </template>
              <div class="c-absolute c-b1 c-l2">
                <img src="@/assets/images/question.svg" alt="" />
              </div>
            </el-tooltip>
          </div>
          <div class="btn-wrapper">
            <el-button
              v-for="btn in quickbtnList"
              class="btn-box"
              style="margin-right: 8px"
              @click="handleQuickSearchBtn(btn.label)"
              :type="btn.type"
              size="small"
              :key="btn.label"
            >
              {{ btn.label }}
              <span class="btn-num-tag" id="preNum"
                >{{ numberFormat(btn.value, true) }}{{ btn.totalValue ? '/' + numberFormat(btn.totalValue, true) : '' }}</span
              >
            </el-button>
          </div>
        </template>
      </c-pagination>
    </div>

    <!-- 创建培训弹窗 -->
    <el-dialog v-model="dialogAddVisible" title="创建培训" width="520" draggable destroy-on-close :close-on-click-modal="false" :show-close="true">
      <meetingForm
        ref="meetingFormAddRef"
        :usersList="allUsersList"
        :usersTree="allUsersTree"
        :methodList="methodList"
        :typeList="typeList"
        :modeList="modeList"
        :characterList="characterList"
        v-loading="createLoading"
      >
      </meetingForm>
      <template #footer>
        <div class="c-flex-xcenter">
          <el-button type="warning" :loading="dialogBtnLoading" @click="onCreate()">确定</el-button>
          <el-button type="info" @click="dialogAddClose()">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改培训弹窗 -->
    <el-dialog v-model="dialogEditVisible" title="修改培训" width="520" draggable destroy-on-close :close-on-click-modal="false" :show-close="true">
      <meetingForm
        ref="meetingFormEditRef"
        :usersList="allUsersList"
        :usersTree="allUsersTree"
        :methodList="methodList"
        :typeList="typeList"
        :modeList="modeList"
        :characterList="characterList"
      >
      </meetingForm>
      <template #footer>
        <div class="c-flex-xcenter">
          <el-button type="warning" :loading="dialogBtnLoading" @click="onEdit()">确定</el-button>
          <el-button type="info" @click="dialogEditClose()">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看签到二维码弹窗 -->
    <el-dialog v-model="dialogQrcodeVisible" title="查看签到二维码" width="240" draggable destroy-on-close :show-close="true">
      <div class="qrcode" ref="qrcodeRef"></div>
    </el-dialog>

    <!-- 查看要求签到人员弹窗 -->
    <el-dialog v-model="dialogTargetVisible" title="查看要求签到人员" width="240" draggable destroy-on-close :show-close="true">
      <c-table v-model:data="targetAttendeesData" height="600" :columnsConfig="targetAttendeesColumns" class="c-flex-1" v-loading="attendeesLoading">
      </c-table>
    </el-dialog>

    <!-- 查看实际签到人员弹窗 -->
    <el-dialog v-model="dialogActualVisible" title="查看实际签到人员" width="480" draggable destroy-on-close :show-close="true">
      <div class="actual-dialog">
        <div class="left">
          <span>实际签到人员</span>
          <c-table
            v-model:data="actualAttendeesData"
            height="600"
            :columnsConfig="actualAttendeesColumns"
            class="c-flex-1"
            v-loading="attendeesLoading"
          >
          </c-table>
        </div>
        <div class="right">
          <span>要求参训未签到人员</span>
          <c-table
            v-model:data="targetAttendeesData"
            height="500"
            :columnsConfig="targetAttendeesColumns"
            class="c-flex-1"
            v-loading="attendeesLoading"
          >
          </c-table>
        </div>
      </div>
    </el-dialog>

    <service-detail ref="serviceDetailRef"></service-detail>

    <file-viewer ref="fileViewerRef"></file-viewer>
    <planForm
      ref="planFormRef"
      :usersList="allUsersList"
      :methodList="methodList"
      :characterList="characterList"
      :modeList="modeList"
      :getList="getList"
    />
  </div>
</template>

<script setup lang="tsx">
// vue
import { shallowRef, ref, onMounted, nextTick, getCurrentInstance, computed } from 'vue'
// API
import {
  getTrainList,
  getBaseMsg,
  getTrainSituation,
  getDingTalkOrgStruct,
  addTrain,
  updateTrain,
  CancelTrainPlan,
  GetTypeCount,
  GetAskOrderCount
} from './request'
// utils
import { useMessage, postMessage } from '@/hooks/useMessage'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isMatchRole } from '@/utils/auth'
import { getDuration } from '@/utils/format'
import QRCode from 'qrcodejs2-fix'
import { getURL } from '@/utils/common'
import { v4 as uuidv4 } from 'uuid'
import { numberFormat } from '@/utils/format.js'
// components
import planForm from './components/planForm.vue'
import meetingForm from './components/meetingForm.vue'
import serviceDetail from '@/views/serve/serviceDetail/index.vue'
import fileViewer from '@/components/global/dynamicImport/fileViewer/index.vue'
import MyButton from '@/components/global/staticImport/search/Button.vue'
import { authStore } from '@/stores/auth'
// resource
import type { QrcodeData, DingTalkTreeNode, UserData, TrainFormData } from './trainType'
// import type { openDetailParam } from '@/views/serve/serviceDetail/serviceDetailTypes'
// icons
const iconQrcode = getURL('assets/icons/icon-form-qrcode.svg')
const iconEdit = getURL('assets/icons/icon-form-edit.svg')
const iconDelete = getURL('assets/icons/icon-form-delete.svg')
// 组件
const meetingFormAddRef = ref<InstanceType<typeof meetingForm> | null>(null)
const meetingFormEditRef = ref<InstanceType<typeof meetingForm> | null>(null)
const serviceDetailRef = ref<InstanceType<typeof serviceDetail> | null>(null)
const fileViewerRef = ref<InstanceType<typeof fileViewer> | null>(null)
const planFormRef = ref<InstanceType<typeof planForm> | null>(null)
const { proxy } = getCurrentInstance()!
onMounted(() => {
  getDicList()
  getList()
  getSelect()
})
// 角色
const isGeneralManager = shallowRef<boolean>(isMatchRole('总经理'))
const isTrainPerson = shallowRef<boolean>(isMatchRole('培训人员'))
const isCreatePlanAuth = shallowRef<boolean>(isMatchRole('人资HR') || isMatchRole('培训人员') || isMatchRole('承包售后主管'))
const isCreateNoticeAuth = shallowRef<boolean>(isMatchRole('人资HR') || isMatchRole('培训人员'))
// 建立 postMessage 连接
useMessage('meetingTrain')
const allUsersTree = shallowRef<DingTalkTreeNode[]>([]) // 全部钉钉用户树型结构
const allUsersList = shallowRef<UserData[]>([]) // 全部钉钉用户信息

// 搜索栏
const queryList = shallowRef<QueryList>({
  type: 2,
  speaker: '',
  trainTheme: '',
  trainLocation: '',
  trainStartTime: '',
  trainEndTime: ''
})
// const statusList = [
//   { label: '通知', value: 0 },
//   { label: '计划', value: 1 },
//   { label: '全部', value: 2 }
// ]
const searchConfig = ref([
  //   { name: 'select', prop: 'type', attr: { optionV2: statusList, placeholder: '类型' }, style: { width: '80px' } },
  { name: 'input', prop: 'speaker', attr: { placeholder: '主讲人' } },
  { name: 'input', prop: 'trainTheme', attr: { placeholder: '培训主题' } },
  { name: 'input', prop: 'trainLocation', attr: { placeholder: '培训地点' } },
  {
    name: 'button',
    text: '查询',
    attr: { type: 'primary', iconName: 'btn-search', iconColor: 'transparent', iconStroke: '#000' },
    on: { click: onSearch }
  },
  {
    name: 'button',
    text: '复制',
    attr: { type: 'warning', iconName: 'btn-copy', iconColor: '#000', iconStroke: 'transparent' },
    on: { click: onOpenCreateCopyDialog },
    isShow: isMatchRole('培训人员')
  }
])
const handleDropdownClick = (event: String) => {
  if (event === '培训通知') {
    if (!isCreateNoticeAuth.value) {
      ElMessage({ type: 'warning', message: '没有权限' })
      return
    }
    onOpenCreateDialog()
  } else if (event === '培训计划') {
    if (!isCreatePlanAuth.value) {
      ElMessage({ type: 'warning', message: '没有权限' })
      return
    }
    planFormRef.value?.open('培训计划', 'add')
  }
}
//打开提问页面
const askQuestion = () => {
  postMessage('jumpAskQuestion')
}
// 弹窗
const dialogAddVisible = shallowRef(false)
const dialogEditVisible = shallowRef(false)
const dialogQrcodeVisible = shallowRef(false)
const dialogTargetVisible = shallowRef(false)
const dialogActualVisible = shallowRef(false)
// 字典列表
const methodList = shallowRef<AnyObject[]>([]) // 方式
const typeList = shallowRef<AnyObject[]>([]) // 来源
const modeList = shallowRef<AnyObject[]>([]) // 类型
const characterList = shallowRef<AnyObject[]>([]) // 适用岗位
// 列表页表格
const loading = shallowRef(false)
const tableData = shallowRef<AnyObject[]>([])
const tableRef = shallowRef()
const multipleSelection = ref<AnyObject[]>([])
const handleSelectionChange = (val: AnyObject[]) => {
  const tableInstance = tableRef.value?.getInstance()
  tableInstance.setCurrentRow() // 单选时行清空
  multipleSelection.value = val
}
const tableConfig = {
  height: '100%',
  width: '100%',
  selectRowOnClick: true,
  'default-sort': { prop: 'trainStartTime', order: 'descending' },
  on: {
    'selection-change': handleSelectionChange
  }
}
const columnsConfig = shallowRef([
  { type: 'selection' },
  { slotName: 'index' },
  { label: '流水号', prop: 'globalApprovalId', slotName: 'globalApprovalId', width: 80 },
  { label: '单据编号', prop: 'id', slotName: 'id', width: 80 },
  { label: '来源', prop: 'trainType', slotName: 'trainType', width: 60 },
  { label: '物料编码', prop: 'materialCode', slotName: 'materialCode', width: 80 },
  { label: '培训主题', prop: 'trainTheme', slotName: 'trainTheme' },
  { label: '创建时间', prop: 'createTime', sortable: true, width: 126 },
  { label: '培训地点', prop: 'trainLocation', width: 100 },
  { label: '适用岗位', prop: 'trainCharacter', slotName: 'trainCharacter', width: 80 },
  { label: '技能级别', prop: 'skills', width: 60 },
  { label: '培训开始时间', prop: 'trainStartTime', sortable: true, width: 126 },
  { label: '培训结束时间', prop: 'trainEndTime', sortable: true, width: 126 },
  { label: '总时长', prop: 'duration', slotName: 'duration', align: 'right', width: 66 },
  { label: '二维码', prop: 'qrcode', slotName: 'qrcode', width: 50 },
  { label: '要求参训', prop: 'trainTraget', slotName: 'trainTraget', align: 'right', width: 60 },
  { label: '实际参训', prop: 'trainNum', slotName: 'trainNum', align: 'right', width: 60 },
  { label: '主讲人', prop: 'speaker', slotName: 'speaker', width: 108 },
  { label: '创建人', prop: 'createUser', slotName: 'createUser', width: 108 },
  { label: '状态', prop: 'status', slotName: 'status', width: 58 },
  { label: '操作', prop: 'oper', slotName: 'oper', width: 52 }
])
// 表单
const dialogBtnLoading = shallowRef(false)
const createLoading = shallowRef(false)
// 签到详情
const attendeesLoading = shallowRef(false)
const targetAttendeesData = shallowRef<AnyObject[]>([])
const targetAttendeesColumns = shallowRef([
  { slotName: 'index' },
  { label: '部门', prop: 'org', width: 50 },
  { label: '签到人', prop: 'employName', width: 75 }
])
const actualAttendeesData = shallowRef<AnyObject[]>([])
const actualAttendeesColumns = shallowRef([
  { slotName: 'index' },
  { label: '部门', prop: 'org', width: 50 },
  { label: '签到人', prop: 'employName', width: 75 },
  { label: '签到时间', prop: 'clockTime', width: 126 }
])

// 分页器
const pagData = ref({ page: 1, pageSize: 200, total: 0, createTime: '' })
// 获取字典列表
const getDicList = () => {
  getBaseMsg().then((res) => {
    if (res.data) {
      const mapList = (propList: any): AnyObject[] => {
        let list: AnyObject[] = propList.map((item: any) => {
          return {
            label: item.dtValue,
            value: item.sortNo
          }
        })
        return list
      }
      methodList.value = mapList(res.data?.methodList)
      typeList.value = mapList(res.data?.typeList)
      modeList.value = mapList(res.data?.modeList)
      characterList.value = mapList(res.data?.characterList)
    }
  })
}
const getKBText = (id: string): string => {
  if (!id) {
    return ''
  }
  let idStr = String(id).padStart(5, '0')
  return `KB-${idStr}`
}
const getDicText = (dicList: AnyObject[], prop: any): string => {
  let result = dicList.find((item) => item.value == prop)?.label || ''
  return result
}
// 获取表格数据
function getList() {
  loading.value = true
  const { page, pageSize } = pagData.value
  const createTimeBegin = pagData.value.createTime ? pagData.value.createTime[0] : ''
  const createTimeEnd = pagData.value.createTime ? pagData.value.createTime[1] : ''
  const tableParams = { ...queryList.value, page, limit: pageSize, createTimeBegin, createTimeEnd }
  getTrainList(tableParams)
    .then((res) => {
      const { code, data, count } = res
      if (code === 200) {
        let list: AnyObject[] = data.map((item: AnyObject) => {
          return {
            ...item,
            duration: getDuration(item.trainStartTime, item.trainEndTime)
          }
        })
        tableData.value = list
        pagData.value.total = count || data.length
      }
    })
    .finally(() => (loading.value = false))
}
// 查询
function onSearch() {
  getList()
}
// 查询
function onDateChange() {
  getList()
}
async function getSelect() {
  const res = await getDingTalkOrgStruct({})
  allUsersTree.value = res?.data?.departments
  getUserList(allUsersTree.value)
}
const isAuth = (row: AnyObject) => {
  return authStore?.userInfo?.userId === row.createUserId
}
// 递归获取数据
function getUserList(data: AnyObject[]) {
  data.forEach((item: AnyObject) => {
    // 树型node操作
    item.employs = item.employs?.map((row: AnyObject) => {
      return {
        ...row,
        label: row.employName,
        id: row.ddUserId,
        type: 'user',
        key: uuidv4()
      }
    })
    // departent
    const departments = item.departments || []
    const employs = item.employs || []
    item.children = [...departments, ...employs]
    item.label = item.orgName || item.label
    item.type = item.type || 'departent'
    item.key = uuidv4()
    // 添加用户列表 allUsersList
    const usersList = employs.map((row: AnyObject) => {
      return {
        ...row,
        label: `${row.employName} (${item.orgName})`,
        value: row.ddUserId,
        orgName: item?.orgName ? [item.orgName] : []
      }
    }) as UserData[]
    usersList.forEach((user: UserData) => {
      const thatUser = allUsersList.value.find((u) => u.ddUserId === user.ddUserId)
      if (!thatUser) {
        allUsersList.value.push(user)
      } else {
        thatUser.orgName?.push(item.orgName)
      }
    })
    if (departments?.length == 0) {
      return
    }
    getUserList(item.departments)
  })
}
// 新建培训
function onOpenCreateDialog() {
  dialogAddVisible.value = true
  nextTick(() => {
    meetingFormAddRef?.value?.initCreate()
  })
}
// 新建复制的培训
async function onOpenCreateCopyDialog() {
  if (multipleSelection.value.length !== 1) {
    return ElMessage.warning('请选择一条数据')
  }
  const isTrainPlan = multipleSelection.value[0].type === 1
  if (isTrainPlan) {
    planFormRef.value?.open('培训计划', 'copy', multipleSelection.value[0].id)
    return
  }
  try {
    const row: AnyObject = multipleSelection.value[0]
    dialogAddVisible.value = true
    createLoading.value = true
    let targerList: AnyObject[] = JSON.parse(row.trainTragetDDUserIds)
    const usersList: UserData[] = []
    targerList.forEach((user: AnyObject) => {
      const item = allUsersList.value.find((u) => u.ddUserId === user.DDUserId)
      if (item) {
        usersList.push(item)
      }
    })
    await nextTick()
    meetingFormAddRef?.value?.copyNew(multipleSelection.value[0], usersList)
    createLoading.value = false
  } catch (e) {
    console.log(e)
    createLoading.value = false
  }
}
async function onCreate() {
  await nextTick()
  const table: TrainFormData[] = meetingFormAddRef?.value?.tableData || []
  const tableUser: UserData[] = meetingFormAddRef?.value?.tableUsersData || []
  // 校验
  if (!table.length) {
    return ElMessage({ type: 'warning', message: '请填写完整数据' })
  }
  for (let i = 0; i < table.length - 1; i++) {
    const row = table[i]
    if (row.prop === 'trainObjects') {
      if (!tableUser.length) {
        return ElMessage({ type: 'warning', message: '请选择培训对象' })
      }
    } else {
      if (!row.details) {
        return ElMessage({ type: 'warning', message: `请填写${row.info}` })
      }
    }
  }
  let param: AnyObject = {
    trainType: table[0].details, // 来源
    trainMode: table[1].details, // 类型
    trainTheme: table[2].details, // 培训主题
    trainContent: table[3].details, // 主要内容
    trainCharacter: table[4].details, // 使用岗位
    speaker: allUsersList.value.find((item: UserData) => item.ddUserId === table[5].details)?.employName || '', // 主讲人
    speakerDDUserId: table[5].details,
    trainObjects: tableUser.map((row) => {
      return {
        ddUserId: row.ddUserId,
        employName: row.employName
      }
    }), // 培训对象
    trainLocation: table[7].details, // 培训地点
    trainMethod: table[8].details, // 培训方式
    trainStartTime: table[9].details, // 培训开始时间
    trainEndTime: table[10].details, // 培训结束时间
    trainTraget: tableUser.length // 培训人数
  }
  console.log('培训创建参数', param)
  dialogBtnLoading.value = true
  try {
    const res: AnyObject = await addTrain(param)
    if (res.code == 200) {
      dialogAddVisible.value = false
      dialogBtnLoading.value = false
      return ElMessage({ type: 'success', message: '操作成功' })
    } else {
      throw res
    }
  } catch (err: any) {
    dialogBtnLoading.value = false
    return ElMessage({ type: 'warning', message: err.message })
  } finally {
    getList()
  }
}
function dialogAddClose() {
  dialogAddVisible.value = false
  dialogBtnLoading.value = false
}
function isOverTime(row: AnyObject) {
  const lastTime = new Date(row.trainStartTime).getTime()
  const now = new Date().getTime()
  return lastTime >= now
}
function handleMeetingEdit(item: AnyObject) {
  const isTrainPlan = item.type === 1
  if (isTrainPlan) {
    planFormRef.value?.open('编辑培训计划', 'edit', item.id)
  } else {
    dialogEditVisible.value = true
    nextTick(() => {
      meetingFormEditRef?.value?.loadData(item)
    })
  }
}
async function onEdit() {
  await nextTick()
  const table: TrainFormData[] = meetingFormEditRef?.value?.tableData || []
  const editData: AnyObject = meetingFormEditRef?.value?.editData || {}
  // 校验
  let trainLocation = table[7].details
  let trainStartTime = table[9].details
  let trainEndTime = table[10].details
  if (!trainLocation) {
    return ElMessage({ type: 'warning', message: '请填写地点' })
  }
  if (!trainStartTime) {
    return ElMessage({ type: 'warning', message: '请填写培训开始时间' })
  }
  if (!trainEndTime) {
    return ElMessage({ type: 'warning', message: '请填写培训结束时间' })
  }
  let param: AnyObject = {
    id: editData.id,
    trainLocation: trainLocation,
    trainStartTime: trainStartTime,
    trainEndTime: trainEndTime
  }
  console.log('培训修改参数', param)
  dialogBtnLoading.value = true
  try {
    const res: AnyObject = await updateTrain(param)
    if (res.code == 200) {
      dialogEditVisible.value = false
      dialogBtnLoading.value = false
      return ElMessage({ type: 'success', message: '操作成功' })
    } else {
      throw res
    }
  } catch (err: any) {
    dialogBtnLoading.value = false
    return ElMessage({ type: 'warning', message: err.message })
  } finally {
    getList()
  }
}
function dialogEditClose() {
  dialogEditVisible.value = false
  dialogBtnLoading.value = false
}
// 打开二维码
function openQrcoDialog(item: AnyObject) {
  dialogQrcodeVisible.value = true
  nextTick(() => {
    if (proxy?.$refs?.qrcodeRef) {
      let param = { scene: 'Meeting', meetingType: 'train', orderId: item.id } as QrcodeData
      new QRCode(proxy.$refs.qrcodeRef, {
        text: JSON.stringify(param), // 二维码承载信息
        width: 220,
        height: 220,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H // 容错级别
      })
    }
  })
}
function openTargetAttendees(row: AnyObject) {
  // 权限控制
  if (!isGeneralManager.value && !isTrainPerson.value) {
    return
  }
  dialogTargetVisible.value = true
  attendeesLoading.value = true
  targetAttendeesData.value = []
  nextTick(() => {
    getTrainSituation({ trainOrderId: row.id, queryType: 1 })
      .then((res) => {
        targetAttendeesData.value = res.data
      })
      .finally(() => {
        attendeesLoading.value = false
      })
  })
}
// 实际参训人数
async function openActualAttendees(row: AnyObject) {
  // 权限控制
  if (!isGeneralManager.value && !isTrainPerson.value) {
    return
  }
  dialogActualVisible.value = true
  attendeesLoading.value = true
  actualAttendeesData.value = []
  targetAttendeesData.value = []
  let targetAttendeesList: AnyObject[] = []
  nextTick(() => {
    Promise.all([getTrainSituation({ trainOrderId: row.id, queryType: 1 }), getTrainSituation({ trainOrderId: row.id, queryType: 2 })])
      .then((resList) => {
        const resTarget = resList[0]
        const resActual = resList[1]
        actualAttendeesData.value = resActual.data
        // 过滤实际查询人员
        resTarget.data.forEach((item: AnyObject) => {
          const index = resActual.data.findIndex((actualItem: AnyObject) => item.employName === actualItem.employName)
          if (index == -1) {
            targetAttendeesList.push(item)
          }
        })
        targetAttendeesData.value = targetAttendeesList
      })
      .finally(() => {
        attendeesLoading.value = false
      })
  })
}
async function handleMeetingDelete(item: AnyObject) {
  const isTrainPlan = item.type === 1
  const message = isTrainPlan ? '确定取消该计划吗？' : '确定取消该培训吗？'
  const param: AnyObject = {
    id: item.id,
    ...(isTrainPlan ? {} : { isCancel: true })
  }
  try {
    await ElMessageBox.confirm(message, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const action = isTrainPlan ? CancelTrainPlan(param) : updateTrain(param)
    const res = await action
    if (res.code === 200) {
      ElMessage({ type: 'success', message: '操作成功' })
      getList()
    }
  } catch (err: any) {
    if (err !== 'cancel') {
      ElMessage({ type: 'warning', message: err.message })
    }
  }
}

// 底部快捷按钮
// interface QuickBtn {
//   label: string
//   value: number
//   type: string
// }
const trainPlanCount = ref(0)
const trainOrderCount = ref(0)
const askNotHandleCount = ref(0)
const askTotalCount = ref(0)
const currBtnType = ref('')
const quickbtnList = computed(() => {
  const types = [
    { label: '培训计划', value: trainPlanCount.value },
    { label: '培训通知', value: trainOrderCount.value },
    { label: '课程', value: 0 },
    { label: '考试列表', value: 0 },
    { label: '题目列表', value: 0 },
    { label: '提问', value: askNotHandleCount.value, totalValue: askTotalCount.value }
  ]
  return types.map((item) => ({
    label: item.label,
    value: item.value,
    totalValue: item.totalValue,
    type: currBtnType.value === item.label ? 'filter' : 'primary'
  }))
})
const getTypeCount = async () => {
  try {
    const createTimeBegin = pagData.value?.createTime?.[0] || ''
    const createTimeEnd = pagData.value?.createTime?.[1] || ''
    const res: any = await GetTypeCount({ createTimeBegin, createTimeEnd })

    if (res.code !== 200) {
      throw new Error(res.message)
    }
    trainPlanCount.value = res.data.trainPlanCount
    trainOrderCount.value = res.data.trainOrderCount
  } catch (err) {
    console.error('获取数量失败', err)
  }
}
const getAskOrderCount = async () => {
  try {
    const res: any = await GetAskOrderCount({})

    if (res.code !== 200) {
      throw new Error(res.message)
    }
    askNotHandleCount.value = res.result.notHandleCount
    askTotalCount.value = res.result.totalCount
  } catch (err) {
    console.error('获取提问单数量失败', err)
  }
}
const handleQuickSearchBtn = (label: string) => {
  if (label === '提问') return askQuestion()
  if (label === currBtnType.value) {
    currBtnType.value = ''
    getList()
    return
  }
  // TODO 待完善
  if (['题目列表', '考试列表', '课程'].includes(label)) {
    tableData.value = []
    pagData.value.total = 0
    return 
  }
  currBtnType.value = label
  // 根据按钮设置查询参数
  queryList.value = {
    type: label === '培训通知' ? 0 : 1,
    speaker: '',
    trainTheme: '',
    trainLocation: '',
    trainStartTime: '',
    trainEndTime: ''
  }
  getList()
  getTypeCount()
}

onMounted(() => {
  getTypeCount()
  getAskOrderCount()
})
</script>
<style lang="scss" scoped>
.qrcode {
  display: flex;
  width: 220px;
  height: 220px;
}

.opration {
  display: flex;
  height: 20px;

  .delete {
    margin-left: 8px;
  }
}

.pointer {
  cursor: pointer;
}

.actual-dialog {
  display: flex;

  .left {
    font-size: 12px;
    margin-right: 8px;
  }

  .right {
    font-size: 12px;
  }
}

:deep(.custom-search) {
  display: flex;
}

:deep(.custom-search .el-button) {
  height: 20px;
}

.btn-wrapper {
  margin-left: 8px;
  display: flex;
  gap: 8px;
  align-items: center;

  :deep(.el-button) {
    height: 18px;
    border-radius: 2px;
    padding: 0 8px;
    font-size: 12px;
    border: none;
    margin-bottom: 0;
  }

  .btn-box {
    position: relative;
    margin-left: 0px;

    .btn-num-tag {
      position: absolute;
      right: -4px;
      top: -8px;
      display: flex;
      color: #e6e6e6;
      height: 14px;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      padding: 0 6px 1px 6px;
      background-color: #ea3553;
      border-radius: 10px;
      z-index: 10;
    }
  }

  .tooltip {
    ul > li {
      display: flex;
      align-items: center;
    }

    img {
      margin: 2px 8px 0 0;
    }
  }
}
.pageination {
  padding-left: 45px;
}
</style>
