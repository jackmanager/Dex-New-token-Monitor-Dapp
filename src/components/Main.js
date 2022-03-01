import React, {Component} from 'react';
import {  Col, Button } from 'react-bootstrap';
import {
    Switch,
    Route,
    Link
} from "react-router-dom";
import Uniswap from './pages/tokenFinder-uniswap';
import Pancakeswap from './pages/tokenFinder-pancakeswap';



class Main extends Component {
    render() {
        return (
            <>
             <Col lg="12" >
                    <Switch>
                        <Route path="/token-listings/uniswap">
                            <Uniswap />
                        </Route>
                        <Route path="/token-listings/pancakeswap">
                            <Pancakeswap />
                        </Route>
                    </Switch>
                </Col>

                <Link to = "/token-listings/uniswap">
                    <Button>Uniswap</Button>
                </Link> 
                <Link to = "/token-listings/pancakeswap">
                    <Button>Pancakeswap</Button>
                </Link> 
            </>
        );
    }
}

export default Main;