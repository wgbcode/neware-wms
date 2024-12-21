// 销售应收和客户应收：可清单状态映射（唯一）
export const orderStatusMap: Record<string, number> = {
  cannot: 0, // 不可清单
  can: 1, // 可清单
  already: 2 // 已清单
}

// 销售应收和客户应收：可清单状态标识
interface CanInterReconMap {
  statusColor: string
  statusTag: string
}
export const canInterReconMap: Record<number, CanInterReconMap> = {
  [orderStatusMap.cannot]: { statusColor: 'var(--tc-global-blue)', statusTag: '' },
  [orderStatusMap.can]: { statusColor: 'var(--tc-global-red)', statusTag: '清' },
  [orderStatusMap.already]: { statusColor: 'var(--tc-global-green)', statusTag: '清' }
}

// 销售应收和客户应收：数据来源
interface DataFromMap {
  fromColor: string
  fromTag: string
}
export const dataFromMap: Record<string, DataFromMap> = {
  neware_201304: { fromColor: 'var(--tc-global-darkblue)', fromTag: '' },
  neware_200907: { fromColor: 'var(--tc-global-darkblue)', fromTag: '09' },
  neware_200409: { fromColor: 'var(--tc-global-darkblue)', fromTag: '04' }
}

export const sboIdMap: Record<string, DataFromMap> = {
  1: { fromColor: 'var(--tc-global-darkblue)', fromTag: '' },
  2: { fromColor: 'var(--tc-global-darkblue)', fromTag: '09' },
  3: { fromColor: 'var(--tc-global-darkblue)', fromTag: '04' }
}