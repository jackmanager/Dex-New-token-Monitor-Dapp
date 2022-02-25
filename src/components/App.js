import React, {Component} from 'react';
import TopNav from './Nav.js';
import './App.css'

import Main from './Main.js';

import {
    BrowserRouter as Router,
} from "react-router-dom";

class App extends Component {

    render () {
        return (
            <div>
                <Router>
                    <TopNav />
                    <Main />
                </Router>
            </div>
        );
    }
}

export default App;