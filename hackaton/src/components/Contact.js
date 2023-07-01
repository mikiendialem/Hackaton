import React from 'react'
import './Contact.css'

function Contact() {
  return (
    <div className='contact'>
      <div className='contact1'>
        <div className='title'>
            <h1>Contact us</h1>
        </div>
      <div className='icons'>
            <i className="far fa-envelope"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-facebook"></i>
            <i className="fab fa-instagram"></i>
      </div>
      </div>
      <div className='ver'></div>
      <div className='quick'>
            <div className='quick-t'>
                <h1>Quick line</h1>
            </div>
            <div className='navs'>
                <p className="nav-item">Home</p>
                <p className="nav-item">Course</p>
                <p className="nav-item">About</p>
                <p className="nav-item">Log out</p>
            </div>
      </div>
      <div className='ver'></div>
      <div className='term'>
            <h1>Terms And Conditions</h1>
            <h4>Privacy Policy</h4>
            <h4>Cookies Policy</h4>
            <h4>Terms and Conditions</h4>
      </div>
    </div>
  )
}

export default Contact
