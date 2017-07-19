import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import Header from './../../components/header.js'

describe('Header', () => {
  it('renders the page', () => {
    let page = TestUtils.renderIntoDocument(<Header />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
    expect(body).toContain('About')
  })
})
