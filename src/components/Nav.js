import React, {Component} from 'react';
import { Navbar,} from 'react-bootstrap';
import { BsCurrencyExchange } from 'react-icons/bs'

class TopNav extends Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    render () {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-dark" style={{  backgroundImage: `url(/topnav.jpg)` , backgroundSize : 'cover'
              }} >
                {/* <!-- Container wrapper --> */}
                <div className="container-fluid">
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <Navbar.Brand href="#home"><h1 className="text-light"><BsCurrencyExchange/>  &nbsp;&nbsp;CRYPTOCURRENCY TOOLS</h1>
                        </Navbar.Brand>
                    </div>
                </div>
                </nav>
        );
    }
}

export default TopNav;
