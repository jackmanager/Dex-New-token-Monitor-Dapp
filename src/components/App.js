import React, {Component} from 'react';
import TopNav from './Nav.js';
import './App.css'
import Main from './Main.js';
import TokenListingTab from './pages/tokenlistingtab.js';
import {
    BrowserRouter as Router,
} from "react-router-dom";

class App extends Component {

    render () {
        return (
            <div>
                <Router>
                    <TopNav />
                    <div class = "row">
                        <div class = "col-1">
                            <TokenListingTab/>
                        </div>
                        <div class = "col-11">
                            <Main />
                        </div>
                    </div>
                </Router>
            </div>
        );
    }
}

export default App;