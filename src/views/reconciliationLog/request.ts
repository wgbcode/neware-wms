import request from '@/utils/request'
// 获取对账日志表格数据
export function GetReconcliationLogList(data: AnyObject) {
  return request({
    url: '/Finance/Journal/GetReconJournalList',
    method: 'post',
    data
  })
}
// 批准
export function approveApi(data: AnyObject) {
  return request({
    url: '/Finance/Journal/ReconPass',
    method: 'post',
    data
  })
}
// 驳回
export function rejectApi(data: AnyObject) {
  return request({
    url: '/Finance/Journal/ReconReject',
    method: 'post',
    data
  })
}
