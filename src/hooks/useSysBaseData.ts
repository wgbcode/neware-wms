import { GetModules, Loadmenus, GetSubOrgs } from '@/api/system'
import { shallowRef } from 'vue'
import { cloneDeep } from 'lodash-es'

export type PermBtn = {
  domId: string
  name: string
  arrt: string
  script: string
  icon: string
  class: string
  remark: string
  sort: number
  moduleId: string
  typeName: string
  typeId: string
  id: string
}

export type Modules = {
  sortNo: number
  id: string
  name: string
  iconName: string
  parentId: string | null
  parentName: string
  status: number
  code: string
  url: string
  cascadeId: string
  isSys: boolean
  children?: null | Modules[]
  value?: string
  label?: string
}

export type SubOrgList = {
  bizCode: string
  cascadeId: string
  corpId: string
  createTime: string
  customCode: string
  hotKey: string
  iconName: string
  id: string
  name: string
  parentName: null | string
  parentId: null | string
  typeId: string
  typeName: string
  sortNo: number
  createId: number
  status: number
  isAutoExpand: boolean
  isLeaf: boolean
  userId: string[]
  userName: string[]
  children?: SubOrgList[]
}

// 获取并缓存所有菜单数据
const modulesTreeData = shallowRef<Modules[]>([])
function getModulesTree(isNeedUpdate?: Boolean): Promise<Modules[]> {
  return new Promise((resolve) => {
    if (modulesTreeData.value.length !== 0 && !isNeedUpdate) {
      resolve(modulesTreeData.value)
    } else {
      GetModules().then((res) => {
        const modules = res.result.map((i: Modules) => ({ ...i, parentId: i.parentId || null }))
        modulesTreeData.value = listToTreeSelect(cloneDeep(modules)).sort((a, b) => a.sortNo - b.sortNo)
        resolve(modulesTreeData.value)
      })
    }
  })
}

function listToTreeSelect(array: Modules[], parent?: Modules | { id: null }, tree?: Modules[]) {
  tree = typeof tree !== 'undefined' ? tree : []
  parent = typeof parent !== 'undefined' ? parent : { id: null }
  const children = array.filter((val) => parent && val.parentId === parent.id)
  if (children.length > 0) {
    if (parent.id === null) {
      tree = children
    } else {
      parent['children'] = children
    }
    children.sort((a, b) => a.sortNo - b.sortNo)
    children.forEach((val) => listToTreeSelect(array, val))
  }
  return tree
}

// 获取并缓存所有权限按钮数据
const authBtnData = shallowRef<PermBtn[]>([])
function getAuthBtn(isNeedUpdate?: Boolean): Promise<PermBtn[]> {
  return new Promise((resolve) => {
    if (authBtnData.value.length !== 0 && !isNeedUpdate) {
      resolve(authBtnData.value)
    } else {
      Loadmenus().then((res) => {
        const { code, result } = res
        if (code === 200) {
          authBtnData.value = result
          resolve(result)
        }
      })
    }
  })
}

// 获取并缓存所有部门数据
const subOrgList = shallowRef<SubOrgList[]>([])
function getSubOrgs(isNeedUpdate?: Boolean): Promise<SubOrgList[]> {
  return new Promise((resolve) => {
    if (subOrgList.value.length !== 0 && !isNeedUpdate) {
      resolve(subOrgList.value)
    } else {
      GetSubOrgs().then((res) => {
        const { code, data } = res
        if (code === 200) {
          subOrgList.value = data
          resolve(data)
        }
      })
    }
  })
}
function orgsArrayToTree(data: SubOrgList[], needEmptyChildren = true) {
  const map: Record<string, SubOrgList> = {}
  const tree: SubOrgList[] = []
  data.forEach((item) => {
    map[item.id] = { ...item, children: [] }
  })
  data.forEach((item) => {
    if (item.parentId !== null) {
      map[item.parentId]?.children?.push(map[item.id])
    } else {
      tree.push(map[item.id])
    }
  })
  deleteChildKey(tree, needEmptyChildren)
  return tree
}
function deleteChildKey(tree: SubOrgList[], needEmptyChildren: boolean) {
  tree.forEach((item) => {
    if (item.children) {
      if (item.children.length === 0) {
        needEmptyChildren || delete item.children
      } else {
        deleteChildKey(item.children, needEmptyChildren)
      }
    }
  })
}

export { getModulesTree, getAuthBtn, getSubOrgs, orgsArrayToTree }
