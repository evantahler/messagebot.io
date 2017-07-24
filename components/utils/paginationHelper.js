import React from 'react'
import { Pagination, Well } from 'react-bootstrap'

export default class extends React.Component {
  // this.props.currentPage => What page are we on?
  // this.props.total       => The total number of items we are paginating
  // this.props.perPage     => How many items are shown per page?
  // this.props.updatePage  => callback with new page number

  handleSelect (newPage) {
    this.props.updatePage(newPage - 1)
  }

  render () {
    const currentPage = parseInt(this.props.currentPage || 0, 10)
    const lastPage = Math.ceil(this.props.total / this.props.perPage) - 1

    if (this.props.total === 0) { return null }
    if (lastPage === 0) { return null }

    return (
      <div>
        <Well>
          <Pagination
            prev={currentPage !== 0}
            first={currentPage !== 0}
            next={lastPage > currentPage}
            last={lastPage > currentPage}
            ellipsis
            items={(lastPage + 1)}
            maxButtons={5}
            activePage={(currentPage + 1)}
            onSelect={this.handleSelect.bind(this)}
          />
        </Well>
      </div>
    )
  }
}
