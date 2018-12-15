/*global google*/
import React, { Component } from 'react';
import Map from "./map";
import Sidebar from './sidebar.js';
import axios from 'axios';

import './App.css';


class App extends Component {
    state = {
        startingMarkers: [],
        store: [],
        mapMarkers: []
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

    filterNames(e) {
        this.setState({ startingMarkers: this.state.store.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase())) })
    }

    componentWillMount() {
        // Start Google Maps API loading since we know we'll soon need it
        this.getGoogleMaps();
    }

    componentDidMount() {
        // Once the Google Maps API has finished loading, initialize the map
        axios.get('https://api.nps.gov/api/v1/parks?stateCode=CO&api_key=V7QlBUCnjRqP5FLGvx9bm4tjcZVNRGnWyT3BLUWk')
            .then(json => json.data.data.map(data => ({
                name: data.fullName,
                id: data.id,
                latLong: data.latLong,
                cat:data.designation
            })))
            .then(newData => this.setState({ startingMarkers: newData, store: newData }))
            .catch(error => alert(error))
    }

    render() {
                var stateMarkers = this.state.startingMarkers;
        var scrubbedMarkers = [];

        for (var i = 0; i < stateMarkers.length; i++) {
            var newLatLong = stateMarkers[i].latLong;

            // convert latLong into object
            let foo = newLatLong
                .split(", ")
                .reduce(function(obj, str, index) {
                    let strParts = str.split(":");
                    if (strParts[0] && strParts[1]) { //<-- Make sure the key & value are not undefined
                        obj[strParts[0].replace(/\s+/g, '')] = strParts[1].trim(); //<-- Get rid of extra spaces at beginning of value strings
                    }
                    return obj;
                }, {});

            newLatLong = foo;


            // clean up API output to match Google Maps API requirements
            const obj1 = stateMarkers[i];
            const newKeys = { latLong: "location" };
            const renamedObj = renameKeys(obj1, newKeys);

            function renameKeys(obj, newKeys) {
                const keyValues = Object.keys(obj).map(key => {
                    const newKey = newKeys[key] || key;
                    return {
                        [newKey]: obj[key]
                    };
                });
                return Object.assign({}, ...keyValues);
            }

            renamedObj.location = newLatLong;
            const renamedObj2 = renameKeys(renamedObj.location, { long: "lng" });
            renamedObj.location = renamedObj2;
            renamedObj.location.lng = parseFloat(renamedObj.location.lng);
            renamedObj.location.lat = parseFloat(renamedObj.location.lat);
            console.log(renamedObj);
            scrubbedMarkers.push(renamedObj);
            stateMarkers[i] = scrubbedMarkers[i];
            console.log(scrubbedMarkers)
            console.log(stateMarkers)
        }

        this.getGoogleMaps().then((google) => {
            const centerPt = { lat: 39.237439, lng: -105.962835 };
            const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 5,
                center: centerPt
            });

            for (var j = 0; j < stateMarkers.length; j++) {
                var position = stateMarkers[j].location;
                var title = stateMarkers[j].name;

                // Create a marker per location, and put into markers array.
                var marker = new google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    id: j
                });

                console.log(marker);
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

        return (
            <div id="app">
              <div id="sidebar">
                <h1>Adventure Finder</h1>
                <hr />
                <h2>Fun Places</h2>
                <Sidebar startMarkers={stateMarkers}/>
              </div>
              <Map startMarkers={stateMarkers}/>
            </div>
        )
    }
}

export default App;