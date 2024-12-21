<template>
  <div>
    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '新增' : '编辑'" width="400" :append-to-body="true" draggable>
      <el-form ref="ruleFormRef" style="max-width: 400px" :model="ruleForm" :rules="rules" label-width="auto" status-icon size="default">
        <el-form-item label="账号" prop="account">
          <el-input v-model="ruleForm.account" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="ruleForm.name" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="ruleForm.password" size="small" placeholder="如果为空则默认与账号相同" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select-v2 v-model="ruleForm.status" :options="statusOptions" placeholder="请选择" size="small" :item-height="24" />
        </el-form-item>
        <el-form-item label="所属机构" prop="organizationIds">
          <el-tree-select
            v-model="ruleForm.organizationIds"
            :data="subOrgTreeList"
            :render-after-expand="false"
            size="small"
            check-strictly
            multiple
            clearable
            :props="{ label: 'name', value: 'id' }"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" v-model="ruleForm.description" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="劳务关系" prop="serviceRelations">
          <el-select-v2
            v-model="ruleForm.serviceRelations"
            :options="categoryNameList"
            placeholder="请选择"
            size="small"
            :item-height="24"
            clearable
            :props="{ label: 'name', value: 'dtValue' }"
          />
        </el-form-item>
        <el-form-item label="标识" prop="indicateCodes">
          <el-select-v2
            v-model="ruleForm.indicateCodes"
            :options="categoryDtCodeList"
            placeholder="请选择"
            size="small"
            :item-height="24"
            multiple
            clearable
            :props="{ label: 'dtValue', value: 'dtCode' }"
          />
        </el-form-item>
        <el-form-item label="银行卡号" prop="cardNo">
          <el-input v-model="ruleForm.cardNo" size="small" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="ERP3.0关联人员" prop="relatedPersonnel">
          <el-select-v2
            v-model="ruleForm.relatedPersonnel"
            :options="rpOption"
            placeholder="请选择"
            size="small"
            :item-height="24"
            filterable
            remote
            clearable
            :loading="rpLoading"
            :remote-method="rpRemoteMethod"
          />
        </el-form-item>
        <el-form-item label="入职时间" prop="entryTime">
          <el-date-picker v-model="ruleForm.entryTime" type="date" placeholder="请选择" size="small" style="width: 100%" />
        </el-form-item>
        <el-form-item class="dd-bind-form" label="钉钉姓名" prop="ddUserName">
          <el-input ref="ddInput" v-model="ruleForm.ddUserName" size="small" placeholder="请输入" @focus="openAddDDNameDialog" />
          <a v-if="ruleForm.ddUserName" @click="unbindDDUser">解绑钉钉</a>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="c-flex-center">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="warning" @click="submitForm(ruleFormRef)" :loading="btnLoading">确定</el-button>
        </div>
      </template>
    </el-dialog>
    <AddDDNameDialog ref="addDDNameDialog" @update="updateDDUserInfo" />
  </div>
</template>

<script lang="tsx" setup>
import { shallowRef, reactive } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { UserData } from '@/views/userManager/types'
import {
  AddOrUpdateUser,
  GetErp3User,
  UpdateDDBindUser,
  UpdateReimaburseServicerRelation,
  GetDelBindUser,
  GetErp3UserSingle
} from '@/views/userManager/request'
import { type SubOrgList } from '@/hooks/useSysBaseData'
import AddDDNameDialog from './AddDDNameDialog.vue'
import { cloneDeep } from 'lodash-es'

defineProps({
  subOrgTreeList: {
    type: Array<SubOrgList>,
    required: true
  },
  categoryNameList: {
    type: Array,
    required: true
  },
  categoryDtCodeList: {
    type: Array,
    required: true
  }
})

const emptyObj: Partial<UserData> = {
  account: '',
  cardNo: '',
  ddUserId: '',
  ddUserName: '',
  description: '',
  entryTime: '',
  id: '',
  indicateCodes: [],
  name: '',
  organizationIds: [],
  password: '',
  nsapUserId: 0,
  relatedPersonnel: '',
  serviceRelations: '',
  status: 0
}
const dialogType = shallowRef('')
const dialogVisible = shallowRef(false)
const ruleFormRef = shallowRef<FormInstance>()
const ruleForm = reactive<Partial<UserData>>(cloneDeep(emptyObj))
const rules = reactive<FormRules<UserData>>({
  account: [{ required: true, message: '', trigger: 'blur' }],
  name: [{ required: true, message: '', trigger: 'blur' }],
  organizationIds: [{ required: true, message: '', trigger: 'blur' }],
  serviceRelations: [{ required: true, message: '', trigger: 'blur' }],
  indicateCodes: [{ required: true, message: '', trigger: 'blur' }],
  entryTime: [{ required: true, message: '', trigger: 'blur' }]
})
const statusOptions = [
  { value: 1, label: '停用' },
  { value: 0, label: '正常' }
]

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      request(AddOrUpdateUser)
    }
  })
}
type Api = (params: Partial<UserData>) => Promise<{ code: number }>
const btnLoading = shallowRef(false)
const emit = defineEmits(['update'])
async function request(api: Api) {
  btnLoading.value = true
  const nsapUserId = rpOption.value.find((i) => i.log_nm === ruleForm?.relatedPersonnel)?.user_id ?? 0
  const organizationIds = getStr('organizationIds')
  const indicateCodes = getStr('indicateCodes')
  const params = { ...ruleForm, organizationIds, indicateCodes, nsapUserId }
  delete params.indicateNames
  delete params.organizations
  api(params)
    .then(async (res) => {
      const { code } = res
      if (code === 200) {
        dialogVisible.value = false
        const { id, serviceRelations } = ruleForm
        await UpdateReimaburseServicerRelation({ userId: id, newServiceRelations: serviceRelations })
        ElMessage({ type: 'success', message: '操作成功' })
        emit('update') // 更新表格
      }
    })
    .finally(() => (btnLoading.value = false))
}
function getStr(key: keyof UserData): string {
  const value = ruleForm[key] as string | string[]
  return typeof value === 'string' ? value : value.join()
}

const addDDNameDialog = shallowRef()
const ddInput = shallowRef()
const openAddDDNameDialog = () => {
  ddInput.value.blur() // 使 input 失去焦点
  addDDNameDialog.value.openDialog()
}

// 钉钉信息绑定
function updateDDUserInfo(data: Record<string, string>) {
  const { userName, userId } = data
  if (userId && userName) {
    UpdateDDBindUser({ userId: ruleForm.id, ddUserId: userId }).then((res) => {
      if (res.code === 200) {
        ruleForm.ddUserId = userId
        ruleForm.ddUserName = userName
        ElMessage({ type: 'success', message: '绑定成功' })
      }
    })
  }
}

// 钉钉信息解绑
function unbindDDUser() {
  GetDelBindUser({ ddUserId: ruleForm.ddUserId }).then((res) => {
    if (res.code === 200) {
      ruleForm.ddUserId = ''
      ruleForm.ddUserName = ''
      ElMessage({ type: 'success', message: '解绑成功' })
    }
  })
}

const openDialog = (type: string, row?: UserData) => {
  dialogType.value = type
  let obj = emptyObj
  if (type !== 'add' && row) {
    const organizationIds = getArr('organizationIds', row)
    const indicateCodes = getArr('indicateCodes', row)
    obj = { ...emptyObj, ...row, organizationIds, indicateCodes }
    getErp3UserSingle(row.id)
  }
  Object.assign(ruleForm, obj)
  dialogVisible.value = true
}
function getArr(key: keyof UserData, row: UserData) {
  return typeof row[key] === 'string' ? (row[key] as string).split(',') : []
}
function getErp3UserSingle(id: string) {
  GetErp3UserSingle({ id }).then(async (res) => {
    const { code, data } = res
    if (code === 200 && data) {
      await rpRemoteMethod()
      ruleForm.nsapUserId = data.user_id
      ruleForm.relatedPersonnel = data.log_nm
    }
  })
}

// 加载 ERP3.0 关联人员下拉列表
interface RpOption {
  user_id: number
  log_nm: string
  user_nm: string
  label: string
  value: string
}
const rpLoading = shallowRef(false)
const rpOption = shallowRef<RpOption[]>([])
const rpRemoteMethod = async (query?: string) => {
  rpLoading.value = true
  try {
    const res = await GetErp3User({ account: query })
    const { code, data } = res
    if (code === 200) {
      rpOption.value = data.map((i: Record<string, string>) => {
        return { ...i, value: i.log_nm, label: i.user_nm }
      })
    }
    rpLoading.value = false
  } catch (_error) {
    rpLoading.value = false
  }
}

defineExpose({ openDialog })
</script>

<style scoped lang="scss">
:deep(.el-form) {
  padding: 0 12px;
}
:deep(.el-form-item) {
  margin-bottom: 0;
}
:deep(.el-form-item label) {
  font-size: 12px;
}
:deep(.dd-bind-form .el-form-item__content) {
  flex-wrap: nowrap;
  a {
    margin-left: 6px;
    white-space: nowrap;
    font-size: 12;
    color: var(--tc-global-blue);
  }
  a:hover {
    opacity: 0.8;
    cursor: pointer;
  }
}
</style>
