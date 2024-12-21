<template>
  <div class="meeting-form">
    <div class="form-table">
      <el-form>
        <c-table
          ref="table"
          :data="tableData"
          height="280px"
          :tableConfig="tableConfig"
          :columnsConfig="columnsConfig"
          v-loading="listLoading"
          :showExpandIcon="false"
        >
          <template #info="{ row }">
            <div class="c-flex">
              <div v-if="row.info !== '类型'">{{ row.info }}</div>
              <el-tooltip v-else effect="dark" placement="top-start" class="tooltip">
                <template #content>
                  <div>新入职包括：企业文化、组织架构、安全生产、岗位所需技能等类型的培训;</div>
                  <div>业务知识包括：公司系统操作与流程、各系列产品软硬件功能及使用介绍等与产品业务相关联的培训;</div>
                  <div>技能提升包括：案例分享、沟通技巧、有助于岗位所需的技能进一步提升类的培训;</div>
                  <div>管理能力包括：对管理层人员领导力、团队建设、战略规划等技能提升的培训。</div>
                </template>
                <div>
                  {{ row.info }}
                  <img class="c-ml4" src="@/assets/images/question.svg" alt="" />
                </div>
              </el-tooltip>
            </div>
          </template>
          <template #details="{ index }">
            <el-form-item prop="list.index.details" :class="{ 'is-error': !tableData[index].details && formCheck }">
              <el-select
                v-if="tableData[index].type == 'select'"
                v-model="tableData[index].details"
                filterable
                placeholder="请选择"
                style="width: 100%"
                :disabled="tableData[index].disabled"
                clearable
              >
                <el-option v-for="item in tableData[index].selectList" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-input
                v-else-if="tableData[index].type == 'input'"
                size="small"
                v-model="tableData[index].details"
                placeholder="请输入"
                :disabled="tableData[index].disabled"
                clearable
              ></el-input>
              <el-date-picker
                v-model="tableData[index].details"
                v-else-if="tableData[index].type == 'date'"
                type="datetime"
                value-format="YYYY.MM.DD HH:mm:ss"
                format="YYYY.MM.DD HH:mm:ss"
                placeholder="请选择"
                :disabled="tableData[index].disabled"
                @change="handleTimeChange"
                style="width: 100%"
                size="small"
                :picker-options="disableDatesOption"
              >
              </el-date-picker>
              <!-- 培训对象 -->
              <div
                class="input-form input"
                :class="{ disabled: tableData[index].disabled }"
                v-else-if="tableData[index].type == 'click' && tableData[index].prop === 'trainObjects'"
                size="mini"
                @click="openOrgSelect(index)"
              >
                <span v-if="tableUsersData && tableUsersData.length == 0" class="placeholder">请选择</span>
                <span v-else>已经选择{{ tableUsersData.length }}人</span>
              </div>
              <!-- 培训地点 -->
              <div
                class="input-form input"
                :class="{ disabled: tableData[index].disabled }"
                v-else-if="tableData[index].type == 'click' && tableData[index].prop === 'trainLocation'"
                size="mini"
                @click="handleSelectLocation(index)"
              >
                <span v-if="!tableData[index].details" class="placeholder">请选择</span>
                <span v-else>{{ tableData[index].details }}</span>
              </div>
              <div class="input-form input" :class="{ disabled: tableData[index].disabled }" v-else-if="tableData[index].type == 'show'">
                <span>{{ duration }}小时</span>
              </div>
            </el-form-item>
          </template>
        </c-table>
      </el-form>
    </div>

    <!-- 选择部门 -->
    <el-dialog v-model="dialogOrgVisible" title="选择部门" width="570" draggable :close-on-click-modal="false" append-to-body :show-close="true">
      <div class="users-select">
        <div>
          <div class="filter">
            <el-select v-model="userTreeSelect" filterable placeholder="请选择" style="width: 100%" @change="handleSelectUser" clearable>
              <el-option v-for="item in usersList" :key="item.key" :label="item.label" :value="item"></el-option>
            </el-select>
          </div>
          <el-scrollbar ref="scrollMenuRef" class="org-select">
            <el-tree
              ref="treeRef"
              :data="usersTree"
              :check-strictly="false"
              show-checkbox
              node-key="key"
              :default-checked-keys="checkedKeysList"
              @check="handleTreeCheck"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :check-on-click-node="true"
            >
              <template #default="{ node }">
                <span class="custom-tree-node">
                  <span>{{ node.label }}</span>
                </span>
              </template>
            </el-tree>
          </el-scrollbar>
        </div>
        <div class="users-selected">
          选中的人：
          <c-table ref="table" :data="tableUsersData" :columnsConfig="tableUserColumns" height="520" :showExpandIcon="false"> </c-table>
        </div>
      </div>
      <template #footer>
        <div class="c-flex-xcenter">
          <el-button type="warning" @click="closeOrgDialog()">确定</el-button>
          <el-button type="info" @click="closeOrgDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 选择地点 -->
    <el-dialog v-model="dialogLocationVisible" title="选择地点" width="500" draggable :close-on-click-modal="false" append-to-body :show-close="true">
      <div class="c-flex-column">
        <div class="c-flex c-mb2" style="font-size: 12px">
          <div class="c-w160">办公区</div>
          <div class="c-w160">楼层</div>
          <div class="c-w150">会议室号</div>
        </div>
        <div class="c-flex">
          <el-select class="c-w150 c-mr8" v-model="workingAreaSelect" filterable placeholder="请选择" @change="handleAreaChange" clearable>
            <el-option v-for="item in workingAreaList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
          <el-select class="c-w150 c-mr8" v-model="floorSelect" filterable placeholder="请选择" clearable>
            <el-option v-for="item in floorList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
          <el-select class="c-w150" v-model="meetingSelect" filterable placeholder="请选择" clearable>
            <el-option v-for="item in meetingList" :key="item" :label="item" :value="item"></el-option>
          </el-select>
        </div>
      </div>
      <template #footer>
        <div class="c-flex-xcenter">
          <el-button type="warning" @click="locationConfirm()">确定</el-button>
          <el-button type="info" @click="closeLocationDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="tsx">
// vue
import { shallowRef, onMounted, ref, nextTick } from 'vue'
import { ElTree, ElMessage } from 'element-plus'
// resource
import type { DingTalkTreeNode, UserData, TrainFormData } from '../trainType'
import { locationList, allFloorList } from '../trainData'
// utils
import moment from 'moment'

const props = defineProps({
  usersList: {
    type: Array<UserData>
  },
  usersTree: {
    type: Array<DingTalkTreeNode>
  },
  methodList: {
    type: Array<AnyObject>
  },
  typeList: {
    type: Array<AnyObject>
  },
  modeList: {
    type: Array<AnyObject>
  },
  characterList: {
    type: Array<AnyObject>
  }
})
const tableConfig: Record<string, unknown> = { stripe: false, 'row-class-name': 'form-row' }
const formInfos = [
  { info: '来源', type: 'select', prop: 'trainType' },
  { info: '类型', type: 'select', prop: 'trainMode' },
  { info: '培训主题', type: 'input', prop: 'trainTheme' },
  { info: '主要内容', type: 'input', prop: 'trainContent' },
  { info: '适用岗位', type: 'select', prop: 'trainCharacter' },
  // { info: '技能级别', type: 'input', prop: 'skill' },
  { info: '主讲人', type: 'select', prop: 'speaker' },
  { info: '培训对象', type: 'click', prop: 'trainObjects' },
  { info: '培训地点', type: 'click', prop: 'trainLocation' },
  { info: '培训方式', type: 'select', prop: 'trainMethod' },
  { info: '培训开始时间', type: 'date', prop: 'trainStartTime' },
  { info: '培训结束时间', type: 'date', prop: 'trainEndTime' },
  { info: '总时长', type: 'show', prop: 'duration' }
]
const disableDatesOption = {
  disabledDate(date: any) {
    const yesterday = Date.now() - 24 * 3600 * 1000
    return date.getTime() <= yesterday
  }
}
const userTreeSelect = ref('')

const tableData = ref<TrainFormData[]>([{ info: '', details: '', type: '', disabled: false, selectList: [] }])
const tableUsersData = shallowRef<UserData[]>([])
const checkedKeysList = shallowRef<string[]>([]) // 选中节点

const workingAreaList = shallowRef<AnyObject[]>([]) // 办公区
const floorList = shallowRef<string[]>([]) // 楼层
const meetingList = shallowRef<string[]>([]) // 会议室号
const workingAreaSelect = ref('')
const floorSelect = ref('')
const meetingSelect = ref('')
const treeRef = ref<InstanceType<typeof ElTree>>()
const listLoading = shallowRef(false)
const formCheck = shallowRef(false) // 表单验证
const editData = shallowRef<AnyObject>({}) // 表单编辑对象
const duration = ref(0) // 表单时长
const dialogOrgVisible = shallowRef(false) // 员工弹窗
const dialogLocationVisible = shallowRef(false) // 位置弹窗
const columnsConfig = shallowRef([
  { slotName: 'index' },
  { label: '培训信息', prop: 'info', slotName: 'info', width: 100 },
  { label: '详情', prop: 'details', slotName: 'details' }
])
const tableUserColumns = shallowRef([
  { slotName: 'index' },
  { label: '部门', prop: 'orgName', width: 100 },
  { label: '姓名', prop: 'employName', width: 100 }
])
onMounted(() => {
  workingAreaList.value = locationList
  floorList.value = allFloorList
  for (let i = 0; i < 9; i++) {
    let strNum = String(i + 1)
    meetingList.value.push(strNum.padStart(2, '0'))
  }
  meetingList.value.push('其他')
})
// 初始化
const initCreate: () => void = () => {
  let list = assignList()
  tableData.value = list
  checkedKeysList.value = []
  tableUsersData.value = []
}
// 列表赋值
const assignList = (): TrainFormData[] => {
  let list: TrainFormData[] = []
  list = formInfos.map((row) => {
    let item = {
      type: row.type,
      prop: row.prop,
      info: row.info,
      details: '',
      disabled: false,
      selectList: [] as AnyObject[]
    }
    if (row.prop === 'trainType') {
      item.selectList = props?.typeList as AnyObject[] // 来源
    }
    if (row.prop === 'trainMode') {
      item.selectList = props?.modeList as AnyObject[] // 类型
    }
    if (row.prop === 'trainMethod') {
      item.selectList = props?.methodList as AnyObject[] // 方式
    }
    if (row.prop === 'trainCharacter') {
      item.selectList = props?.characterList as AnyObject[] // 适用岗位
    }
    if (row.prop === 'speaker') {
      item.selectList = props.usersList || []
    }
    return item
  })
  return list
}
// 复制
const copyNew: (currentRow: AnyObject, userList: UserData[]) => void = (currentRow, userList) => {
  let list = assignList()
  let copyProps = [
    'trainType',
    'trainMode',
    'trainTheme',
    'trainContent',
    'trainCharacter',
    'speaker',
    'trainObjects',
    'trainLocation',
    'trainMethod'
  ]
  copyProps.forEach((prop) => {
    const item = list.find((row) => row.prop === prop)
    // 复制值
    if (item && Object.prototype.hasOwnProperty.call(currentRow, prop)) {
      if (prop === 'speaker') {
        let name = ''
        if (currentRow.speaker.split('-').length > 1) {
          name = currentRow.speaker.split('-')[1]
        }
        const user = props.usersList?.find((u) => u.employName === name)
        item.details = user?.ddUserId || currentRow.speaker
        item.selectList = props.usersList || []
      } else {
        item.details = currentRow[prop]
      }
    }
  })
  tableData.value = list
  // 获取选中对象
  checkedKeysList.value = []
  userList.forEach((item: UserData) => {
    if (item.key) {
      checkedKeysList.value.push(item.key)
    }
  })
  tableUsersData.value = userList
}
function loadData(currentRow: AnyObject) {
  editData.value = currentRow
  let list = assignList()
  let editProps = ['trainLocation', 'trainStartTime', 'trainEndTime']
  formInfos.forEach((row) => {
    let prop = row.prop
    const item = list.find((row) => row.prop === prop)
    // 复制值
    if (item) {
      item.disabled = true
      if (item && Object.prototype.hasOwnProperty.call(currentRow, prop)) {
        item.details = currentRow[prop]
      }
      if (editProps.includes(prop)) {
        item.disabled = false
      }
    }
  })
  // 总时长
  let startTime = moment(currentRow.trainStartTime)
  let endTime = moment(currentRow.trainEndTime)
  const durationInHours = endTime.diff(startTime, 'hours', true) || 0
  duration.value = Math.floor(Number(durationInHours) * 100) / 100
  tableData.value = list
  tableUsersData.value = new Array(Number(currentRow.trainTraget || 0)).fill({ label: '' })
}
defineExpose({ initCreate, copyNew, loadData, tableData, tableUsersData, editData })

function handleTimeChange() {
  if (!tableData.value[9].details || !tableData.value[10].details) {
    duration.value = 0
    return
  }
  let startTime = moment(tableData.value[9].details)
  let endTime = moment(tableData.value[10].details)
  const durationInHours = endTime.diff(startTime, 'hours', true) || 0
  duration.value = Math.floor(Number(durationInHours) * 100) / 100
}
function openOrgSelect(index: number) {
  if (tableData.value[index].disabled) {
    return
  }
  dialogOrgVisible.value = true
  nextTick(() => {
    if (!tableUsersData.value.length) {
      // 用于初始化时清空选项
      treeRef.value!.setCheckedKeys([])
      handleTreeCheck()
    }
  })
}
const handleSelectLocation = (index: number) => {
  if (tableData.value[index].disabled) {
    return
  }
  let location = tableData.value[index].details
  if (location.split('-').length > 2) {
    workingAreaSelect.value = location.split('-')[0]
    floorSelect.value = location.split('-')[1]
    meetingSelect.value = location.split('-')[2]
  }
  dialogLocationVisible.value = true
  nextTick(() => {})
}
const handleAreaChange = (value: any) => {
  if (value == 'SZZY') {
    floorList.value = ['12F', '15F']
  } else if (value == 'SZXYD') {
    floorList.value = ['22F', '23F']
  } else {
    floorList.value = ['1F', '2F', '3F', '4F', '5F', '6F', '7F']
  }
}
const locationConfirm = () => {
  // 校验
  if (!workingAreaSelect.value || !floorSelect.value || !meetingSelect.value) {
    return ElMessage.warning('请补全信息')
  }
  tableData.value[7].details = `${workingAreaSelect.value}-${floorSelect.value}-${meetingSelect.value}`
  dialogLocationVisible.value = false
}
const closeLocationDialog = () => {
  dialogLocationVisible.value = false
}
function handleTreeCheck() {
  let checkAllNodes = treeRef.value!.getCheckedNodes(false, false) as UserData[] // 包含父节点
  let usersList: UserData[] = []
  // 筛选+去重
  checkAllNodes.forEach((user: UserData) => {
    if (user.type === 'user' && !usersList.some((u) => u.id === user.id)) {
      usersList.push({ employName: user.employName, ddUserId: user.ddUserId })
    }
  })
  tableUsersData.value = usersList
}
function closeOrgDialog() {
  dialogOrgVisible.value = false
}

// 下拉框选择
function handleSelectUser(val: AnyObject) {
  if (!val) {
    return
  }
  let selectedKeys: string[] = []
  let checkChildrenNodes = treeRef.value!.getCheckedNodes(true, false) as AnyObject[]
  selectedKeys = checkChildrenNodes.map((item: AnyObject) => item.key)
  selectedKeys.push(val.key)
  nextTick(() => {
    treeRef.value!.setCheckedKeys(selectedKeys, true)
    handleTreeCheck()
    // 展开
    traverseExpanded(treeRef.value!.getNode(val.key))
  })
}
// 遍历展开树节点
function traverseExpanded(node: AnyObject) {
  node.expanded = true
  if (node.parent) {
    traverseExpanded(node.parent)
  }
}
</script>
<style lang="scss" scoped>
.el-select--small {
  :deep(.el-tooltip__trigger) {
    width: 100%;
  }
}

.input-form {
  width: 100%;
  height: 20px;
  background-color: var(--tc-input-background);
  color: var(--tc-global-yellow);
  cursor: pointer;
  font-size: 12px;
  padding: 0 4px !important;

  .placeholder {
    color: var(--tc-watermark-text);
  }

  &.disabled {
    background-color: var(--tc-input-disable-background);
    color: var(--tc-primary-text);
    cursor: no-drop;
  }
}

.users-select {
  display: flex;
  flex-direction: row;

  .org-select {
    width: 300px;
    height: 500px;
  }

  .users-selected {
    margin-left: 10px;
  }

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

.filter {
  padding: 4px;
  margin-bottom: 8px;

  :deep(.el-select__caret) {
    line-height: 20px;
  }
}
</style>
