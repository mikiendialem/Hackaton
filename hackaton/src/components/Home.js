import React from 'react'
import {Link} from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className='home'>
        <div className='nav'>
            <div className='logon'>
                <h1>&lt;FE<span>N</span>OTE&gt;</h1>
            </div>
            <div className='nav-l'>
                <ul>
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/course">Course</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/signin">Sign in</Link></li>
                    <li><Link to="/signup"><button className="signup-button">Sign up</button></Link></li>
                </ul>
            </div>
        </div>
            <div className='home-sec'>
                <h1>Welcome to <br />ፍኖት</h1>
            </div>
        </div>
  )
}

export default Home
