import React from 'react'
import { Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import Link from 'next/link'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      refreshInterval: props.refreshInterval
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.refreshInterval) {
      this.setState({refreshInterval: nextProps.refreshInterval})
    }
  }

  updateRefreshInterval (val) {
    this.props.updateRefeshInterval(val)
  }

  render () {
    return (
      <Navbar>
        <NavHeaderAndIcon loggedIn={this.props.loggedIn} />
        <Navbar.Collapse>
          <Nav pullLeft>
            <NavItem href='/system/resque/overview'>Overview</NavItem>
            <NavItem href='/system/resque/failed'>Failed</NavItem>
            <NavItem href='/system/resque/workers'>Workers</NavItem>
            <NavItem href='/system/resque/delayed'>Delayed</NavItem>
            <NavItem href='/system/resque/locks'>Locks</NavItem>
          </Nav>

          <Nav pullRight />

          <Nav pullRight>
            <NavDropdown id='reactRefreshPicker' title={`Refesh Interval: ${this.state.refreshInterval}s`}>
              <MenuItem onClick={this.updateRefreshInterval.bind(this, 0)} >0s</MenuItem>
              <MenuItem onClick={this.updateRefreshInterval.bind(this, 1)} >1s</MenuItem>
              <MenuItem onClick={this.updateRefreshInterval.bind(this, 5)} >5s</MenuItem>
              <MenuItem onClick={this.updateRefreshInterval.bind(this, 30)} >30s</MenuItem>
              <MenuItem onClick={this.updateRefreshInterval.bind(this, 60)} >60s</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

class NavHeaderAndIcon extends React.Component {
  render () {
    return (
      <Navbar.Header>
        <Navbar.Brand>
          <Link className='navbar-brand' href='/system/resque/overview'>
            <a>
              <div style={{margin: 15}}>Resque</div>
            </a>
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
    )
  }
}
