import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import button from './button.vue'

describe('测试 Button 组件', () => {
  it('组件名称是"测试按钮"', () => {
    const wrapper = mount(button, {
      props: {
        buttonText: '测试按钮'
      }
    })
    expect(wrapper.text()).toBe('测试按钮')
  })

  it('组件 className 包含 test1', () => {
    const wrapper = mount(button)
    expect(wrapper.classes()).toContain('test1')
  })
})
