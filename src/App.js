/*global google*/
import React, { Component } from 'react';
import Map from "./map";
// import SearchFilter from "./search";
// import ListView from "./list";


import './App.css';


class App extends Component {
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
                const API = 'AIzaSyACWMB_JIajzui95zCOQCMz5d0WYpjh0X4';
                script.src = `https://maps.googleapis.com/maps/api/js?key=${API}&callback=resolveGoogleMapsPromise`;
                script.async = true;
                script.defer = true;
                document.body.appendChild(script);
            });
        }

        // Return a promise for the Google Maps API
        return this.googleMapsPromise;
    }

    componentWillMount() {
        // Start Google Maps API loading since we know we'll soon need it
        this.getGoogleMaps();
    }

    componentDidMount() {
        // Once the Google Maps API has finished loading, initialize the map
        this.getGoogleMaps().then((google) => {
            const centerPt = { lat: 40.110656, lng: -109.050415 };
            const map = new google.maps.Map(document.getElementById('map'), {
                zoom: 5,
                center: centerPt
            });
            const marker = new google.maps.Marker({
                position: centerPt,
                map: map
            });
        });
    }

    render() {
        return (
            <div>
              <h1>Contact</h1>
              <Map />
            </div>
        )
    }
}

export default App;