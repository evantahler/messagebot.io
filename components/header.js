import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import { Navbar, Nav, NavItem } from 'react-bootstrap'

export default class extends React.Component {
  constructor () {
    super()
    this.state = { activeKey: null, hoverKey: null }
  }

  componentDidMount () {
    if (!process || process.browser) {
      this.setState({activeKey: Router.pathname})
    }
  }

  onMouseEnter (matchKey) {
    this.setState({hoverKey: matchKey})
  }

  onMouseLeave () {
    this.setState({hoverKey: null})
  }

  linkStyle (matchKey) {
    let decoration = null
    if (
      (this.state.activeKey && this.state.activeKey.match(matchKey)) ||
      (this.state.hoverKey && this.state.hoverKey.match(matchKey))
    ) {
      decoration = '3px solid currentColor'
    }

    return {
      borderBottom: decoration
    }
  }

  render () {
    return (
      <header>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              {
                this.props.loggedIn
                ? <Link href='/dashboard'><a><div style={{margin: 15}}>MessageBot</div></a></Link>
                : <Link href='/'><a><div style={{margin: 15}}>MessageBot</div></a></Link>
              }
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav pullRight />

            {
              this.props.loggedIn ? null : <Nav pullLeft>
                <Link href='/about'>
                  <NavItem><span onMouseEnter={() => { this.onMouseEnter('/about') }} onMouseLeave={() => { this.onMouseLeave() }} style={this.linkStyle('/about')}>About</span></NavItem>
                </Link>
              </Nav>
            }

            {
              this.props.loggedIn ? null : <Nav pullLeft>
                <Link href='/join'>
                  <NavItem><span onMouseEnter={() => { this.onMouseEnter('/join') }} onMouseLeave={() => { this.onMouseLeave() }} style={this.linkStyle('/join')}>Join</span></NavItem>
                </Link>
              </Nav>
            }

            {
              this.props.loggedIn ? null : <Nav pullRight>
                <Link href='/sign-in'>
                  <NavItem><span onMouseEnter={() => { this.onMouseEnter('/sign-in') }} onMouseLeave={() => { this.onMouseLeave() }} style={this.linkStyle('/sign-in')}>Sign In</span></NavItem>
                </Link>
              </Nav>
            }

            {
              this.props.loggedIn ? <Nav pullRight>
                <Link href='/sign-out'>
                  <NavItem><span onMouseEnter={() => { this.onMouseEnter('/sign-out') }} onMouseLeave={() => { this.onMouseLeave() }} style={this.linkStyle('/sign-out')}>Sign Out</span></NavItem>
                </Link>
              </Nav>
              : null
            }

          </Navbar.Collapse>
        </Navbar>
      </header>
    )
  }
}
