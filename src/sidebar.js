/*global google*/
import React, { Component } from 'react';
import axios from 'axios';
import Map from "./map.js";


class Sidebar extends Component {
    state = {
        value: 'All',
        startingMarkers: [],
        store: [],
        mapMarkers: [],
        selectedItem: []
    }

    pickCat(e) {
        this.setState({ value: e });
    }

    getGoogleMaps() {
        // If we haven't already defined the promise, define it
        if (!this.googleMapsPromise) {
            this.googleMapsPromise = new Promise((resolve) => {
                // Add a global handler for when the API finishes loading
                window.resolveGoogleMapsPromise = () => {
                    // Resolve the promise
                    resolve(google);
                    // Tidy up
                    delete window.resolveGoogleMapsPromise;
                };

                // Load the Google Maps API
                const script = document.createElement("script");
                const APIKey = 'AIzaSyACWMB_JIajzui95zCOQCMz5d0WYpjh0X4';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${APIKey}&callback=resolveGoogleMapsPromise`;
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            });
        }

        // Return a promise for the Google Maps API
        return this.googleMapsPromise;
    }

    generateMap() {
        this.getGoogleMaps().then((google) => {
            var stateMarkers = this.state.startingMarkers;
            var filteredMarkers = [];
            const centerPt = { lat: 37.018168, lng: -109.027637 };
            const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 5,
                center: centerPt
            });

            // new array of markers filtered by dropdown selection
            if (this.state.value === 'All') {
                filteredMarkers = this.state.startingMarkers;
            } else {
                filteredMarkers = stateMarkers
                    .filter(marker =>
                        marker.cat === this.state.value)
            }

            var largeInfowindow = new google.maps.InfoWindow();

            // create marker per filtered query
            for (var j = 0; j < filteredMarkers.length; j++) {
                var position = filteredMarkers[j].location;
                var title = filteredMarkers[j].name;
                var url = filteredMarkers[j].url;
                var id = filteredMarkers[j].id;
                var image = 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png';

                // Create a marker per location, and put into markers array.
                if (title === this.state.selectedItem.name) {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: position,
                        title: title,
                        id: id,
                        icon: image
                    });

                    var updatedSelectedItem = this.state.selectedItem;
                    var selectedURL = updatedSelectedItem.url;
                    console.log(updatedSelectedItem);
                    var allToggle = [...document.getElementsByClassName('toggle')];
                    for (var s = 0; s < allToggle.length; s++) {
                     allToggle[s].style.display="none";
                        var compareURL = allToggle[s].children[0].href;
                        if (compareURL === selectedURL) {
                            if (allToggle[s].style.display === "block") {
                                allToggle[s].style.display = "none";
                                console.log(allToggle[s]);
                            } else {
                                allToggle[s].style.display = "block";
                            };
                        }
                    }

                } else {
                    var marker = new google.maps.Marker({
                        map: map,
                        position: position,
                        title: title,
                        id: id,
                        animation: google.maps.Animation.DROP
                    });
                }

                marker.addListener('click', function() {
                    populateInfoWindow(this, largeInfowindow);
                });
            }

            function populateInfoWindow(marker, infowindow) {
                // Check to make sure the infowindow is not already opened on this marker.
                if (infowindow.marker !== marker) {
                    infowindow.marker = marker;
                    infowindow.setContent('<div class="infowindow">' + marker.title + '</div>');
                    infowindow.open(map, marker);
                    // Make sure the marker property is cleared if the infowindow is closed.
                    infowindow.addListener('closeclick', function() {
                        infowindow.setMarker = null;
                    });
                }
            }

        })
    }

    componentWillMount() {
        // Start Google Maps API loading since we know we'll soon need it
        this.getGoogleMaps();
        axios.get('https://api.nps.gov/api/v1/parks?stateCode=CO,UT,NM,AZ&api_key=V7QlBUCnjRqP5FLGvx9bm4tjcZVNRGnWyT3BLUWk')
            .then(json => json.data.data.map(data => ({
                name: data.fullName,
                id: data.id,
                location: data.latLong,
                cat: data.designation,
                url: data.url,
                directions: data.directionsUrl,
                weather: data.weatherInfo
            })))
            .then(newData => this.setState({ startingMarkers: newData, store: newData }))
            .catch(error => alert(error));
    }

    // function to fix latlong data from NPS.gov API output - from string to object
    // call later on, during render
    fixLatLong() {
        var startingMarkersState = this.state.startingMarkers;
        // if startingMarkers have already been downloaded, start fixing the array we pulled
        if (typeof startingMarkersState != "undefined") {
            for (var j = 0; j < startingMarkersState.length; j++) {
                // check if location data is string; if so, run the function to fix it
                if (typeof startingMarkersState[j].location === "string") {
                    // convert location string into object
                    var oldLocation = startingMarkersState[j].location;
                    var KeyVal = oldLocation.split(", ");
                    var i;
                    var obj = {};
                    for (i in KeyVal) {
                        KeyVal[i] = KeyVal[i].split(":");
                        obj[KeyVal[i][0]] = KeyVal[i][1];
                    }
                    startingMarkersState[j].location = obj;

                    // convert new object values to numbers from strings

                    var oldLat = startingMarkersState[j].location.lat;
                    var oldLong = startingMarkersState[j].location.long;
                    var newLat = Number(oldLat);
                    var newLong = Number(oldLong);
                    startingMarkersState[j].location.lat = newLat;
                    startingMarkersState[j].location.long = newLong;

                    // convert location.long key to location.lng
                    function renameKeys(obj, newKeys) {
                        const keyValues = Object.keys(obj).map(key => {
                            const newKey = newKeys[key] || key;
                            return {
                                [newKey]: obj[key]
                            };
                        });
                        return Object.assign({}, ...keyValues);
                    }
                    const obj = startingMarkersState[j].location;
                    const newKeys = { long: "lng" };
                    const renamedObj = renameKeys(obj, newKeys);
                    startingMarkersState[j].location = renamedObj;
                }
                // if location data is already an object (function already ran once after data was downloaded), just log a confirmation
                else {
                    console.log('locations fixed');
                }
            }
        }
    }

    // function for adding an event listener to each list item so we can make the markers on the map show accordingly
    eventListenerList = (data) => {
        this.setState({ selectedItem: data });
    }

    render() {
        console.log(this.state.startingMarkers);
        this.fixLatLong();

        this.generateMap();
        var stateValue = this.state.value;
        var startMarkers = this.state.startingMarkers;

        return (
            <div className="content">
            <div className="options">
               <h2 className="filter-heading">Category Filter</h2>
                <select
                  id="selector"
                  value={this.state.value}
                  onChange={(event)=>this.pickCat(event.target.value)}
                >
                    <option id="All" value="All">All</option>
                    <option id="HistoricSite" value="National Historic Site">National Historic Site</option>
                    <option id="NatlPark" value="National Park">National Park</option>
                    <option id="NatlParkPres" value="National Park & Preserve">National Park & Preserve</option>
                    <option id="NatlMonu" value="National Monument">National Monument</option>
                    <option id="NatlRec" value="National Recreation Area">National Recreation Area</option>
                </select>

          <ul>
          {stateValue==="All" ? (
                startMarkers
                .map(markerList => (
                 <li key={markerList.id} onClick={() => this.eventListenerList(markerList)}>
                <h3>{markerList.name}</h3>
                   <div className="toggle">
                    <a href={markerList.url}>Website</a> / / <a href={markerList.directions}>Directions</a><br />
                    <p>{markerList.weather}</p>
                   </div>
                </li>
                ))
           ):(
              startMarkers
              .filter(marker => 
                marker.cat===this.state.value)
              .map(markerList => (
                <li key={markerList.id} onClick={() => this.eventListenerList(markerList)}>
                <h3>{markerList.name}</h3>
                   <div className="toggle">
                    <a href={markerList.url}>Website</a>/ /
                    <a href={markerList.directions}>Directions</a><br />
                    <p>{markerList.weather}</p>
                   </div>
                </li>
              ))
           )
          }
            
          </ul>
          </div>
          <Map />
          </div>
        )

    }
}

export default Sidebar