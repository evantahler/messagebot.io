import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import About from '../../pages/about.js'

describe('About', () => {
  it('renders the page', () => {
    let page = TestUtils.renderIntoDocument(<About />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('replacement')
  })
})
