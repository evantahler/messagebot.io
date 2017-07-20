import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import Header from './../../components/header.js'

describe('Header', () => {
  it('renders the page', () => {
    let page = TestUtils.renderIntoDocument(<Header />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
  })

  it('shows logged out stuff', () => {
    let page = TestUtils.renderIntoDocument(<Header loggedIn={false} />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
    expect(body).toContain('About')
    expect(body).toContain('Sign In')
  })

  it('shows logged in stuff', () => {
    let page = TestUtils.renderIntoDocument(<Header loggedIn />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
    expect(body).toContain('Sign Out')
  })
})
