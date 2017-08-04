import React from 'react'

export default class extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: props.value || '',
      editor: null
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value && nextProps.value !== this.state.value) {
      this.setState({value: nextProps.value}, () => {
        if (this.state.editor) { this.state.editor.doc.setValue(this.state.value) }
      })
    }
  }

  componentDidMount () {
    window.CodeMirror = require('codemirror')
    require('codemirror/mode/htmlmixed/htmlmixed')

    let editor = window.CodeMirror(
      document.getElementById('__codemirror'),
      {
        value: this.state.value,
        lineWrapping: true,
        viewportMargin: Infinity,
        height: 'auto',
        mode: 'htmlmixed',
        lineNumbers: true
      }
    )

    editor.on('change', () => {
      let value = editor.doc.getValue()
      this.setState({value}, () => {
        this.props.onValueChange(value)
      })
    })

    this.setState({editor})
  }

  render () {
    return (
      <div id='__codemirror' />
    )
  }
}
