import React from 'react'
import { render } from 'react-dom'
import { act } from 'react-dom/test-utils'

import Footer from '../../components/footer'

let container

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  document.body.removeChild(container)
  container = undefined
})

describe('Introcudtion Section', () => {
  it('renders the section', () => {
    act(() => { render(<Footer />, container) })
    const footer = container.querySelector('div')
    expect(footer.textContent).toContain('MessageBot')
    expect(footer.textContent).toContain((new Date()).getFullYear())
  })
})
