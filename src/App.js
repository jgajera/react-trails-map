import React, { Component } from 'react';
import Sidebar from './sidebar.js';

import './App.css';


class App extends Component {
    render() {
        return (
            <div id="app">
              <div id="sidebar">
                <h2 className="pre-heading">Find Fun Places</h2>
                <h1>Colorado Adventure Seeker</h1>
                <Sidebar/>
              </div>
            </div>
        )
    }
}

export default App;