import React, { Component } from 'react';
import Markers from './markers.js';

class Map extends Component {
    render() {
    	console.log(this.props.startMarkers);

        return (
            <div id="map">
            	<Markers startMarkers={this.props.startMarkers}/>
            </div>
        );
    }
}

export default Map