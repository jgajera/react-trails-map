import React, { Component } from 'react';
import Map from './map.js'

class Sidebar extends Component {
    state = {
        value: 'ShowAll'
    }

    handleChange(e) {
        this.setState({ value: e });
    }

    render() {
        return (
          <div class="content">
            <div class="options">
               <h2 class="filter-heading">Filter by Category</h2>

                <select
                  id="selector"
                  value={this.state.value}
                  onChange={(event)=>this.handleChange(event.target.value)}
                >
                    <option id="ShowAll" value="all">All</option>
                    <option id="HistoricSite" value="National Historic Site">National Historic Site</option>
                    <option id="NatlPark" value="National Park">National Park</option>
                    <option id="NatlParkPres" value="National Park & Preserve">National Park & Preserve</option>
                    <option id="HistoricTrail" value="National Historic Trail">National Historic Trail</option>
                    <option id="NatlMonu" value="National Monument">National Monument</option>
                    <option id="NatlRec" value="National Recreation Area">National Recreation Area</option>
                </select>

          <ul>
            {this.props.startMarkers
              .filter(marker => 
                marker.cat===this.state.value)
              .map(markerList => (
                <li key={markerList.id}>
                {markerList.name}
                </li>
              ))}
          </ul>
          </div>
          <Map startMarkers={this.props.startMarkers}/>
          </div>
        )

    }
}

export default Sidebar