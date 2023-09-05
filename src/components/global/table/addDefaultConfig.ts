import type { ColumnsConfig } from './index.vue'

export const addTableDefaultConfig = (tableConfig: Record<string, any> | undefined) => {
  const config = (tableConfig ??= {})
  config.stripe ??= true
  config.border ??= true
  config['style'] ??= { width: config.width ?? '100%' }
  config['highlight-current-row'] ??= true
  return tableConfig
}

export const addColumnsDefaultConfig = (columnsConfig: ColumnsConfig) => {
  return columnsConfig.map((config) => {
    config['show-overflow-tooltip'] ??= true
    config.child && addColumnsDefaultConfig(config.child)
    return config
  })
}
