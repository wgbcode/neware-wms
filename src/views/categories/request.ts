import request from '@/utils/request'

// 获取字典类型
export function CategoryTypes(params: AnyObject) {
  return request({
    url: '/CategoryTypes/Load',
    method: 'get',
    params
  })
}

// 添加字典类型
export function AddCategoryTypes(data: AnyObject) {
  return request({
    url: '/CategoryTypes/Add',
    method: 'post',
    data
  })
}

// 删除字典类型
export function DeleteCategoryTypes(data: AnyObject) {
  return request({
    url: '/CategoryTypes/Delete',
    method: 'post',
    data
  })
}

// 获取字典
export function Categorys(params: AnyObject) {
  return request({
    url: '/categorys/load',
    method: 'get',
    params
  })
}

// 添加字典
export function AddCategory(data: AnyObject) {
  return request({
    url: '/categorys/add',
    method: 'post',
    data
  })
}

// 修改字典
export function UpdateCategory(data: AnyObject) {
  return request({
    url: '/categorys/update',
    method: 'post',
    data
  })
}

// 删除字典
export function DeleteCategory(data: string[]) {
  return request({
    url: '/categorys/delete',
    method: 'post',
    data
  })
}
