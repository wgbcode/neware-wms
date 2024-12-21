import { getURL } from '@/utils/common'

const iconQuestion = getURL('assets/icons/icon-sn-protected.svg')
const iconLink = getURL('assets/icons/icon-link.svg')
const iconProtected = getURL('assets/icons/icon-sn-protected.svg') // 保内
const iconOut = getURL('assets/icons/icon-sn-out.svg') // 保外
const iconMtrNew = getURL('assets/icons/icon-mtr-new.svg') // 新物料
const iconMtrReplace = getURL('assets/icons/icon-mtr-replace.svg') // 替换物料
const iconFormAdd = getURL('assets/icons/icon-form-add.svg') // 表单新增
const iconFormDelete = getURL('assets/icons/icon-form-delete.svg') // 表单删除
export { iconQuestion, iconLink, iconProtected, iconOut, iconFormAdd, iconFormDelete, iconMtrNew, iconMtrReplace }
export const questionTypeList = {
  基础信息: 1,
  软件问题: 2,
  硬件问题: 3,
  中位机: 4,
  温箱: 5,
  校准工装: 6,
  自动化: 7,
  其它: 8
}
// 代理部门
export const agentOrgList = [
  'CS3',
  'CS7',
  'CS12',
  'CS14',
  'CS17',
  'CS20',
  'CS29',
  'CS32',
  'CS34',
  'CS36',
  'CS37',
  'CS38',
  'CS39',
  'CS50',
  'CSYH',
  'P5',
  'P6',
  'P8',
  'P14'
]
