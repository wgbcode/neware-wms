import request from '@/utils/request'

// 获取培训列表
export function getTrainList(params: AnyObject<string | number>) {
  return request({
    url: `/serve/Train/GetTrainList`,
    method: 'get',
    params
  })
}

// 新增培训通知单
export function addTrain(data: AnyObject) {
  return request({
    url: `/serve/Train/AddTrain`,
    method: 'post',
    data
  })
}

// 编辑培训通知单
export function updateTrain(data: AnyObject) {
  return request({
    url: `/serve/Train/UpdateTrain`,
    method: 'post',
    data
  })
}

// 签到
export function trainClock(data: AnyObject<string | number>) {
  return request({
    url: `/serve/Train/TrainClock`,
    method: 'post',
    data
  })
}

// 获取培训单培训人员情况
export function getTrainSituation(params: AnyObject<string | number>) {
  return request({
    url: `/serve/Train/GetTrainSituation`,
    method: 'get',
    params
  })
}

// 主讲人/培训对象/数据来源
export function getDingTalkOrgStruct(params: AnyObject<string | number>) {
  return request({
    url: `/Technician/GetDingTalkOrgStruct`,
    method: 'get',
    params
  })
}

// 获取培训字典列表
export function getBaseMsg() {
  return request({
    url: `/serve/Train/GetBaseMsg`,
    method: 'get'
  })
}
// 创建计划字典
export function CreateTrainPlan(data: Record<string, string | number>) {
  return request({
    url: `/serve/Train/CreateTrainPlan`,
    method: 'post',
    data,
  })
}
// 更新计划字典
export function UpdateTrainPlan(data: Record<string, string | number>) {
  return request({
    url: `/serve/Train/UpdateTrainPlan`,
    method: 'post',
    data,
  })
}
// 获取计划详情
export function TrainPlanDetails(params: Record<string, string | number>) {
  return request({
    url: `/serve/Train/TrainPlanDetails`,
    method: 'get',
    params
  })
}

// 删除计划
export function CancelTrainPlan(params: Record<string, string | number>) {
  return request({
    url: `/serve/Train/CancelTrainPlan`,
    method: 'GET',
    params,
  })
}
// 底部小红点数据量
export function GetTypeCount(params: Record<string, string | number>) {
  return request({
    url: `/serve/Train/GetTypeCount`,
    method: 'GET',
    params,
  })
}
// 底部小红点数量-提问单
export function GetAskOrderCount(params: AnyObject<string | number>) {
  return request({
    url: `/Ask/AskOrder/GetAskOrderCount`,
    method: 'GET',
    params,
  })
}

