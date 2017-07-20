import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import Join from '../../pages/join.js'

describe('Join', () => {
  it('renders the page', () => {
    let page = TestUtils.renderIntoDocument(<Join />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('Prices and Plans')
  })
})
