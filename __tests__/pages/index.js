import React from 'react'
import { render } from 'react-dom'
import { act } from 'react-dom/test-utils'

import IndexPage from './../../pages/index'

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
    act(() => { render(<IndexPage />, container) })
    const headerOne = container.querySelector('h1')
    expect(headerOne.textContent).toContain('Message Bot')

    const headerTwo = container.querySelector('h2')
    expect(headerTwo.textContent).toContain('Framework')
  })
})
