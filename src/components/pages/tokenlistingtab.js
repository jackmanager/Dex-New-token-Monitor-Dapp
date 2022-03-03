import React, {Component} from 'react';
import './tokenlistingtab.css'
import {
    Link
} from "react-router-dom";
import { Button } from 'react-bootstrap';
import UniswapImage from '../../asset/uniswap.jpg';
import SushiswapImage from '../../asset/sushiswap.png';

class TokenListingTab extends Component {

    render () {
        return (
            <div>
                <br/>
                <Link to = "/token-listings/uniswap">
                    <Button><img src={UniswapImage} /></Button>
                </Link> 
                <br/>
                <Link to = "/token-listings/pancakeswap">
                    <Button><img src={SushiswapImage} /></Button>
                </Link> 
            </div>
        );
    }
}

export default TokenListingTab;