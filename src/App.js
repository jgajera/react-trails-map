/*global google*/
import React, { Component } from 'react';
import Map from "./map";
// import SearchFilter from "./search";
// import ListView from "./list";
import Sidebar from './sidebar.js';
import SearchBar from './searchbar.js';
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
        axios.get('https://api.nps.gov/api/v1/parks?parkCode=rmnp&parkCode=&stateCode=CO&api_key=V7QlBUCnjRqP5FLGvx9bm4tjcZVNRGnWyT3BLUWk')
            .then(json => json.data.data.map(data => ({
                name: data.fullName,
                id: data.id,
                latLong: data.latLong
            })))
            .then(newData => this.setState({ startingMarkers: newData, store: newData }))
            .then(
                this.getGoogleMaps().then((google) => {
                    const centerPt = { lat: 40.110656, lng: -109.050415 };
                    const map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 5,
                        center: centerPt
                    });
                    // const marker = new google.maps.Marker({
                    //     position: centerPt,
                    //     map: map
                    // });

                })).catch(error => alert(error))
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

            var position = renamedObj.location;
            var title = renamedObj.name;
            var id = renamedObj.id;

            // Create a marker per location, and put into markers array.
            var marker = new google.maps.Marker({
                position: position,
                title: title,
                id: id
            });

            console.log(renamedObj)
            scrubbedMarkers.push(renamedObj);
            console.log(scrubbedMarkers)
        }
        return (
            <div id="app">
              <div id="sidebar">
                <h1>Adventure Finder</h1>
                <SearchBar startMarkers={scrubbedMarkers}/>
                <hr />
                <h2>Fun Places</h2>
                <Sidebar startMarkers={scrubbedMarkers}/>
              </div>
              <Map startMarkers={scrubbedMarkers}/>
            </div>
        )
    }
}

export default App;