import React from 'react'
import { Row, Col } from 'react-bootstrap'
import { withGoogleMap, GoogleMap, Marker } from 'react-google-maps'
import withScriptjs from 'react-google-maps/lib/async/withScriptjs'

// TODO: modularize this to read ENV
const googleMapURL = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDu7Ou4jGlIJKoelqr2i0Y2wrWZ14_x-C0`

const MapWrapper = withScriptjs(withGoogleMap(props => (
  <GoogleMap
    zoom={props.zoom}
    center={props.center}
  >
    {
      props.markers.map((marker) => {
        return (
          <Marker key={marker.name}
            position={{lat: marker.lat, lng: marker.lng}}
            onClick={() => props.onMarkerClick(marker)}
          />
        )
      })
    }
  </GoogleMap>
)))

export default class extends React.Component {
  // requires:
  // `this.props.section`: The name of the thing we are reasoning about (people, messages, etc)
  // `this.props.points`: array of points to draw (or you can use `this.props.point` to pass one point in)
  //    Each point has:
  //    lat, lng, name

  constructor (props) {
    super(props)
    this.state = {
      points: (props.points || [])
    }
  }

  componentWillReceiveProps (newProps) {
    if (newProps.point) {
      let point = {
        lat: newProps.point.lat,
        lng: newProps.point.lng || newProps.point.lon,
        name: newProps.point.name || newProps.name || 'point'
      }

      this.setState({points: [point]})
    } else if (newProps.points) {
      this.setState({points: newProps.points})
    }
  }

  render () {
    if (this.state.points.length === 0) { return null }
    if (!this.state.points[0].lat && !this.state.points[0].lat) { return null }

    let latTotal = 0
    let lngTotal = 0

    this.state.points.forEach(function (point) {
      latTotal += point.lat
      lngTotal += point.lng
    })

    const center = {
      lat: (latTotal / this.state.points.length),
      lng: (lngTotal / this.state.points.length)
    }

    const container = <div style={{height: 200, width: '100%'}} />

    return (
      <Row>
        <Col md={12}>
          <h2>Map</h2>
        </Col>

        <Col md={12}>
          <MapWrapper
            googleMapURL={googleMapURL}
            loadingElement={container}
            containerElement={container}
            mapElement={container}
            center={center}
            zoom={5}
            markers={this.state.points}
            onMarkerClick={(marker) => { console.log(marker) }}
          />
        </Col>
      </Row>
    )
  }
}
