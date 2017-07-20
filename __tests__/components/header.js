import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'

import Header from './../../components/header.js'

const navigation = [
  {
    'title': 'MessageBot',
    'align': 'left',
    'glyphicon': 'info-sign',
    'loggedIn': false,
    'elements': [
      {
        'route': '/',
        'title': 'Home',
        'glyphicon': 'user',
        'highlights': [
          '^/$'
        ]
      },
      {
        'route': '/about',
        'title': 'About',
        'glyphicon': 'info-sign',
        'highlights': [
          '^/about$'
        ]
      }
    ]
  },
  {
    'title': 'App',
    'align': 'right',
    'glyphicon': 'user',
    'loggedIn': false,
    'elements': [
      {
        'route': '/sign-in',
        'title': 'Sign In',
        'glyphicon': 'user',
        'highlights': [
          '^/sign-in$'
        ]
      }
    ]
  },
  {
    'title': 'Data',
    'align': 'left',
    'glyphicon': 'equalizer',
    'loggedIn': true,
    'elements': [
      {
        'route': '/people/recent',
        'title': 'People: Recent',
        'glyphicon': 'user',
        'highlights': [
          '^/people/recent.*$'
        ]
      },
      {
        'route': '/people/search',
        'title': 'People: Search',
        'glyphicon': 'user',
        'highlights': [
          '^/people/search.*$'
        ]
      },
      {
        'route': '/person/new',
        'title': 'Person: New',
        'glyphicon': 'user',
        'highlights': [
          '^/person/new$'
        ]
      },
      {
        'divider': true
      },
      {
        'route': '/events/recent',
        'title': 'Events: Recent',
        'glyphicon': 'equalizer',
        'highlights': [
          '^/events/recent.*$'
        ]
      },
      {
        'route': '/events/search',
        'title': 'Events: Search',
        'glyphicon': 'equalizer',
        'highlights': [
          '^/events/search.*$'
        ]
      },
      {
        'route': '/event/new',
        'title': 'Event: New',
        'glyphicon': 'equalizer',
        'highlights': [
          '^/event/new$'
        ]
      },
      {
        'divider': true
      },
      {
        'route': '/messages/recent',
        'title': 'Messages: Recent',
        'glyphicon': 'envelope',
        'highlights': [
          '^/messages/recent.*$'
        ]
      },
      {
        'route': '/messages/search',
        'title': 'Messages: Search',
        'glyphicon': 'envelope',
        'highlights': [
          '^/messages/search.*$'
        ]
      }
    ]
  },
  {
    'title': 'Communication',
    'align': 'left',
    'glyphicon': 'send',
    'loggedIn': true,
    'elements': [
      {
        'route': '/lists/list',
        'title': 'Lists',
        'glyphicon': 'folder-open',
        'highlights': [
          '^/lists/list.*$',
          '^/list/.*$'
        ]
      },
      {
        'route': '/templates/list',
        'title': 'Templates',
        'glyphicon': 'file',
        'highlights': [
          '^/templates/list.*$',
          '^/template/.*$'
        ]
      },
      {
        'route': '/campaigns/list',
        'title': 'Campaigns',
        'glyphicon': 'send',
        'highlights': [
          '^/campaigns/list.*$',
          '^/campaign/.*$'
        ]
      }
    ]
  },
  {
    'title': 'System',
    'align': 'right',
    'glyphicon': 'flash',
    'loggedIn': true,
    'elements': [
      {
        'route': '/system/status',
        'title': 'Status',
        'glyphicon': 'flash',
        'highlights': [
          '^/status$'
        ]
      },
      {
        'divider': true
      },
      {
        'route': '/system/settings',
        'title': 'Settings',
        'glyphicon': 'cog',
        'highlights': [
          '^/settings$'
        ]
      },
      {
        'route': '/system/resque/overview',
        'title': 'Resque',
        'glyphicon': 'road',
        'highlights': null
      },
      {
        'divider': true
      },
      {
        'route': '/user/edit',
        'title': 'Account',
        'glyphicon': 'user',
        'highlights': [
          '^/account$'
        ]
      },
      {
        'route': '/users/list',
        'title': 'Users',
        'glyphicon': 'th',
        'highlights': [
          '^/users$'
        ]
      },
      {
        'route': '/sign-out',
        'title': 'Sign Out',
        'glyphicon': 'off',
        'highlights': [
          '^/sign-out$'
        ]
      }
    ]
  }
]

describe('Header', () => {
  it('renders the page', () => {
    let page = TestUtils.renderIntoDocument(<Header />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
  })

  it('shows logged out stuff', () => {
    let page = TestUtils.renderIntoDocument(<Header loggedIn={false} navigation={navigation} />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
    expect(body).toContain('About')
    expect(body).toContain('Sign In')
  })

  it('shows logged in stuff', () => {
    let page = TestUtils.renderIntoDocument(<Header loggedIn navigation={navigation} />)
    let body = ReactDOM.findDOMNode(page).textContent

    expect(body).toContain('MessageBot')
    expect(body).toContain('Sign Out')
  })
})
