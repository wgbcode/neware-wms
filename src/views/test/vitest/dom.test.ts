import { getPage } from './dom.js'
import { expect, test } from 'vitest'

test('Page Content is "Hello world!"', () => {
  expect(getPage().mainFrame.document.body.textContent).toBe('Hello world!')
})
