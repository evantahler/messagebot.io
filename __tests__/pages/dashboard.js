import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import Dashboard from '../../pages/dashboard.js'

describe('Dashboard', () => {
  it('renders the page', () => {
    let page = TestUtils.renderIntoDocument(<Dashboard />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('Dashboard')
  })
})
