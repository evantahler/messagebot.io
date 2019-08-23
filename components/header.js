import React from 'react'
import { Navbar, Nav } from 'react-bootstrap'

export default function Header () {
  return (
    <header>
      <br />

      <Navbar bg='light' expand='lg'>
        <Navbar.Brand href='/'>Message Bot</Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='mr-auto'>
            <Nav.Link href='/'>Home</Nav.Link>
            <Nav.Link target='_new' href='https://www.delicioushat.com'>Delicious Hat</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <br />
    </header>
  )
}
