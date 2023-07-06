import React from 'react'
import Home from './Home'
import About from './About'
import Course from './Course'
import Contact from './Contact'
import './All.css'

function All() {
  return (
    <div className='all'>
        <Home/>
        <About/>
        <Course/>
        <div className='test'>
            <h1>Testimonials</h1>
            <div className='test-sec1'>
                <div className='test-first'>
                    <div className='test-sec1-check'>
                        <div className='prof'></div>
                        <h2>NAME</h2>
                        <p>profesion</p>
                    </div>
                    <div className='test-sec1-check1'>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
                    </div>
                </div>
                <div className='test-first'>
                    <div className='test-sec1-check'>
                        <div className='prof'></div>
                        <h2>NAME</h2>
                        <p>profesion</p>
                    </div>
                    <div className='test-sec1-check1'>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
                    </div>
                </div>
            </div>
            <div className='test-sec1'>
                <div className='test-first'>
                        <div className='test-sec1-check'>
                            <div className='prof'></div>
                            <h2>NAME</h2>
                            <p>profesion</p>
                        </div>
                        <div className='test-sec1-check1'>
                            <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
                        </div>
                </div>
                <div className='test-first'>
                    <div className='test-sec1-check'>
                        <div className='prof'></div>
                        <h2>NAME</h2>
                        <p>profesion</p>
                    </div>
                    <div className='test-sec1-check1'>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit.</p>
                    </div>
                </div>
            </div>
        </div>
        <div className='meet'>
            <h1>Meet Our Instructor</h1>
            <div className='meet-sec'>
                <div className='meet1'>
                    <div className='profile'></div>
                    <h2>Name</h2>
                    <p>Profession</p>
                </div>
                <div className='meet1'>
                    <div className='profile'></div>
                    <h2>Name</h2>
                    <p>Profession</p>
                </div>
                <div className='meet1'>
                    <div className='profile'></div>
                    <h2>Name</h2>
                    <p>Profession</p>
                </div>
                <div className='meet1'>
                    <div className='profile'></div>
                    <h2>Name</h2>
                    <p>Profession</p>
                </div>
            </div>  
        </div>
        <div className="partner">
            <div className='img1'></div>
            <div className="img2"></div>
            <div className="img3"></div>
        </div>
      <Contact/>
    </div>
  )
}

export default All
