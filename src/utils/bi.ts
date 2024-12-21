import FAT_IMG from '@/assets/table/F.svg'
import { AreaMark } from './areaMark'

// 敏感地区名称
export const SENSITIVE_AREAS: string[] = [
  '阿富汗',
  '白俄罗斯',
  '缅甸',
  '中非共和国',
  '古巴',
  '刚果民主共和国',
  '埃塞俄比亚',
  '伊朗',
  '伊拉克',
  '黎巴嫩',
  '利比亚',
  '马里',
  '尼加拉瓜',
  '朝鲜',
  '俄罗斯',
  '索马里',
  '苏丹',
  '叙利亚',
  '乌克兰',
  '委内瑞拉',
  '也门',
  '津巴布韦'
]

// 校验开票地址是否有敏感地区
/**
 * @param {String} address
 * @param {Boolean} isFlag 是否处理为FAT客户
 */
export function validateCity(data: AnyObject, isFlag = false) {
  const { address, address2, isFat } = data
  if (isFlag) {
    return isFat ? FAT_IMG : false
  }
  if (!address?.length || !address2?.length) return false
  const res = SENSITIVE_AREAS.filter((item) => {
    return address.includes(item) || address2.includes(item)
  })
  return res?.length ? 'redColor' : false
}

// 业务代码地区标识
export function validateAreaMark(data: AnyObject) {
  const address = data?.address || ''
  if (!address?.length) return ''
  const jpRes = AreaMark.JP.filter((item) => {
    return address.includes(item)
  })
  const krRes = AreaMark.KR.filter((item) => {
    return address.includes(item)
  })
  // 美洲
  const usRes = AreaMark.US.filter((item) => {
    return address.includes(item)
  })
  // 欧洲
  const euRes = AreaMark.EU.filter((item) => {
    return address.includes(item)
  })
  // 非洲
  const afRes = AreaMark.AF.filter((item) => {
    return address.includes(item)
  })
  // 亚洲
  const asRes = AreaMark.AS.filter((item) => {
    return address.includes(item)
  })
  // 东南亚
  const seaRes = AreaMark.SEA.filter((item) => {
    return address.includes(item)
  })
  // 中东地区
  const meRes = AreaMark.ME.filter((item) => {
    return address.includes(item)
  })
  // 大洋洲
  const oaRes = AreaMark.OA.filter((item) => {
    return address.includes(item)
  })
  if (jpRes?.length) {
    // JP_IMG
    return 'JP'
  } else if (krRes?.length) {
    return 'KR'
  } else if (usRes?.length) {
    return 'US'
  } else if (euRes?.length) {
    return 'EU'
  } else if (afRes?.length) {
    return 'AF'
  } else if (asRes?.length) {
    return 'AS'
  } else if (seaRes?.length) {
    return 'SEA'
  } else if (meRes?.length) {
    return 'ME'
  } else if (oaRes?.length) {
    return 'OA'
  } else {
    return ''
  }
}
