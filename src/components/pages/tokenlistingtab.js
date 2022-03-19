import React, {Component} from 'react';
import './tokenlistingtab.css'
import {
    Link
} from "react-router-dom";
import { Button } from 'react-bootstrap';
import UniswapImage from '../../asset/uniswap.jpg';
import PancakeswapImage from '../../asset/pancakeswap.jpg';

class TokenListingTab extends Component {

    render () {
        return (
            <div>
                <br/>
                <Link to = "/token-listings/uniswap">
                    <Button><img alt="uniswap" src={UniswapImage} /></Button>
                </Link>
                <br/>
                <Link to = "/token-listings/pancakeswap">
                    <Button><img alt="pancakeswap" src={PancakeswapImage} /></Button>
                </Link>
            </div>
        );
    }
}

export default TokenListingTab;