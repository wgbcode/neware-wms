import type { ColumnsConfig } from './index.vue'

export const addVirTableDefaultConfig = (tableConfig: Record<string, any> | undefined) => {
  const config = (tableConfig ??= {})
  config.fixed ??= true
  return config
}

export const addVirColumnsDefaultConfig = (columnsConfig: ColumnsConfig) => {
  return columnsConfig.map((config) => {
    return config
  })
}
