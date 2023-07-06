import React,{useState} from 'react'
import {Link} from 'react-router-dom'
import './Signup.css'

function Signup() {
    const[toggle,setToggle]=useState(false);
    const togglePasswordVisibility = () => {
        setToggle(!toggle);
      };
  return (
    <div className='child'>
      <div className='child-back'>
            <div className='child-back-log'>
                <h1>&lt;FE<span>N</span>OTE&gt;</h1>
            </div>
      </div>
      <div className='child-log'>
        <h2>Welcome Back!</h2>
            <div className='login'>
                <form>
                    <label>
                        Phone: <br/>
                        <input type="text" placeholder='number' required="number"/>
                    </label>
                    <label>
                        Username: <br/>
                        <input type="text" placeholder='username' />
                    </label>
                    <label>
                        Password: <br/>
                        <input type={toggle ? "text" : "password"} placeholder='********'/>
                        <i class={toggle? "far fa-eye-slash" : "far fa-eye"} onClick={togglePasswordVisibility}></i><br/>
                        <span ></span>
                        {/* <small style={{color:"red"}}>*This field is required.</small><br/> */}
                        {/* <p><Link to="/">Forgot password?</Link></p> */}
                    </label>
                    <label>
                        Confirm password: <br/>
                        <input type={toggle ? "text" : "password"} placeholder='********'/>
                        <i class={toggle? "far fa-eye-slash" : "far fa-eye"} onClick={togglePasswordVisibility}></i><br/>
                        <span ></span>
                    </label>
                    <button type="submit">Sign up</button>
                </form>
            </div>
        <div className='next'>
            <p>Already have an account?<Link to="/signin">Login</Link></p>
        </div>
        </div>
    </div>
  )
}

export default Signup
