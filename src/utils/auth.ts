import Cookies from 'js-cookie'
import { authStore } from '@/stores/auth'

const TokenKey = 'WMSAUTHUSERTOKEN'
const RefreshTokenKey = 'WMSAUTHUSERREFRESHTOKEN'

export const getToken = (): string => Cookies.get(TokenKey)
export const setToken = (token: string) => Cookies.set(TokenKey, token)
export const removeToken = () => Cookies.remove(TokenKey)
export const getRefreshToken = (): string => Cookies.get(RefreshTokenKey)
export const setRefreshToken = (refreshToken: string) => Cookies.set(RefreshTokenKey, refreshToken)
export const removeRefreshToken = () => Cookies.remove(RefreshTokenKey)
// 当前用户是否拥有对应角色
export function isMatchRole(roleName: string | string[]) {
  if (!Array.isArray(roleName)) {
    roleName = [roleName]
  }
  const rolesList = (authStore.userInfo?.roles || []) as string[]
  const hasRolesList = (rolesList && rolesList.length) as unknown
  if (hasRolesList) {
    return roleName.some((name) => {
      return rolesList.indexOf(name) > -1
    })
  } else {
    return false
  }
}
