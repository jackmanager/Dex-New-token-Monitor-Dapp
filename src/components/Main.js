import React, {Component} from 'react';
import {  Col, Button } from 'react-bootstrap';
import {
    Switch,
    Route,
    Link
} from "react-router-dom";
import Uniswap from './uniswap';



class Main extends Component {
    render() {
        return (
            <>
             <Col lg="12" >
                    <Switch>
                        <Route path="/token-listings/uniswap">
                            <Uniswap />
                        </Route>
                    </Switch>
                </Col>

                <Link to = "/token-listings/uniswap">
                    <Button>Uniswap</Button>
                </Link> 
            </>
        );
    }
}

export default Main;