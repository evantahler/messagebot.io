import React from 'react'
import { Table, Glyphicon, FormGroup, FormControl } from 'react-bootstrap'
import Link from 'next/link'
import Moment from 'moment'
import WordHelper from './wordHelper.js'

export default class extends React.Component {
  /*
  - `this.props.objects` is an array
  - `this.props.edit` is a function (or null to hide)
  - `this.props.copy` is a function (or null to hide)
  - `this.props.destroy` is a function (or null to hide)
  - `this.props.recordType` is the name of the item (for guid linksm IE: 'person')
  - `this.props.idName` (optional) what heading to use for the ID colum?
  - `this.props.inlineEdit` is an object containing the callback events on-submit for in-line forms, ie: `{name: handleNameChange}`
  - the objects have either `id`, `guid`, or `name` which is the primary key
  - `this.props.ignoredKeys` is an array of things to ignore in the form, or you can send `this.props.onlyKeys` to have a smaller list
  */

  constructor () {
    super()
    this.state = {
      objects: []
    }
  }

  keys () {
    let keys = []
    let importantKeys = ['id', 'guid', 'createdAt', 'updatedAt', 'name', 'source', 'type', 'transport', 'personGuid']

    if (this.props.onlyKeys && this.props.onlyKeys.length > 0) {
      return this.props.onlyKeys
    }

    if (this.props.objects.length > 0) {
      keys = Object.keys(this.props.objects[0])
      keys = keys.sort()

      importantKeys.reverse().forEach(function (k) {
        if (keys.indexOf(k) >= 0) {
          keys.splice(keys.indexOf(k), 1)
          keys = [k].concat(keys)
        }
      })

      if (this.props.ignoredKeys && this.props.ignoredKeys.length > 0) {
        this.props.ignoredKeys.forEach(function (p) {
          if (keys.indexOf(p) >= 0) {
            keys.splice(keys.indexOf(p), 1)
          }
        })
      }
    }

    return keys
  }

  componentWillReceiveProps (nextProps) {
    this.setState({objects: nextProps.objects})
  }

  handleChange (event) {
    const parts = event.target.id.split('%%')
    const keyId = parts[0]
    const key = parts[1]
    let i = 0
    let objects = []

    while (i < this.state.objects.length) {
      let o = this.state.objects[i]
      if (
        (o.id && o.id.toString() === keyId) ||
        (o.guid && o.guid.toString() === keyId) ||
        (o.name && o.name.toString() === keyId)
      ) {
        o[key] = event.target.value
      }
      objects[i] = o
      i++
    }

    this.setState({objects: objects})
  }

  renderKey (object, key, keyId) {
    if (key === 'guid' && this.props.recordType) {
      return (
        <td key={'key-' + key}>
          <Glyphicon glyph='cog' />
          <Link href={`/${this.props.recordType}/${object[key]}`}><a> {object[key]} </a></Link>
        </td>
      )
    }

    if (key === 'id' && this.props.recordType) {
      return (
        <td key={'key-' + key}>
          <Glyphicon glyph='cog' />
          <Link href={`/${this.props.recordType}/${object[key]}`}><a> {object[key]} </a></Link>
        </td>
      )
    }

    if (key === 'personGuid') {
      return (
        <td key={'key-' + key}>
          <Link href={`/person/${object[key]}`}><a> {object[key]} </a></Link>
        </td>
      )
    }

    if (key === 'createdAt' || key === 'updatedAt') {
      return <td key={'key-' + key}>{ Moment(object[key]).calendar() }</td>
    }

    if (object[key] === null || object[key] === undefined) {
      return <td key={'key-' + key} />
    }

    if (typeof object[key] === 'object') {
      return <td key={'key-' + key}><pre>{ JSON.stringify(object[key], null, 2) }</pre> </td>
    }

    if (this.props.inlineEdit && typeof this.props.inlineEdit[key] === 'function') {
      let originalCallback = this.props.inlineEdit
      let callback = (event) => {
        event.preventDefault()
        return originalCallback[key](object, key, keyId)
      }

      return (
        <td key={'key-' + key}>
          <form onSubmit={callback}>
            <FormGroup controlId={`${keyId}%%${key}`} style={{height: '20px'}}>
              <FormControl value={object[key] || ''} onChange={this.handleChange.bind(this)} type='text' />
            </FormGroup>
          </form>
        </td>
      )
    }

    return <td key={'key-' + key}>{object[key]}</td>
  }

  render () {
    if (this.state.objects.length === 0) {
      return null
    }

    return (
      <Table striped bordered condensed hover responsive>
        <thead>
          <tr>
            {
                this.keys().map((key) => {
                  if (key === 'id' && this.props.idName) {
                    return <th key={key}>{ this.props.idName }</th>
                  } else {
                    return <th key={key}>{ WordHelper.titleize(key) }</th>
                  }
                })
            }

            {
              ['edit', 'clone', 'destroy'].map((k) => {
                if (typeof this.props[k] === 'function') {
                  return (<th key={k} />)
                } else {
                  return null
                }
              })
            }

          </tr>
        </thead>

        <tbody>
          {
            this.state.objects.map((object) => {
              let keyId = (object.id || object.guid || object.name)

              return (
                <tr key={keyId}>
                  {
                    this.keys().map((key) => { return this.renderKey(object, key, keyId) })
                  }

                  <EditColumn keyId={keyId} edit={this.props.edit} />
                  <CloneColumn keyId={keyId} clone={this.props.clone} />
                  <DeleteColumn keyId={keyId} destroy={this.props.destroy} />
                </tr>
              )
            })
          }
        </tbody>
      </Table>
    )
  }
}

class EditColumn extends React.Component {
  render () {
    if (typeof this.props.edit === 'function') {
      return <td><Glyphicon glyph='pencil' id={this.props.keyId} onClick={this.props.edit} /> </td>
    } else {
      return null
    }
  }
}

class CloneColumn extends React.Component {
  render () {
    if (typeof this.props.clone === 'function') {
      return <td><Glyphicon glyph='duplicate' id={this.props.keyId} onClick={this.props.clone} /> </td>
    } else {
      return null
    }
  }
}

class DeleteColumn extends React.Component {
  render () {
    if (typeof this.props.destroy === 'function') {
      return <td><Glyphicon glyph='remove' id={this.props.keyId} onClick={this.props.destroy} /> </td>
    } else {
      return null
    }
  }
}
