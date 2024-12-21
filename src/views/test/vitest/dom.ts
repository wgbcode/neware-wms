import { Browser } from 'happy-dom'

export const getPage = () => {
  const browser = new Browser()
  const page = browser.newPage()
  page.url = 'https://example.com'
  page.content = '<html><body>Hello world!</body></html>'
  return page
}
