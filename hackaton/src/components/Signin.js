import React, { useState} from 'react'
import './Signin.css'
import { Link } from 'react-router-dom'


function Signin() {
    const[toggle,setToggle]=useState(false);
    const togglePasswordVisibility = () => {
        setToggle(!toggle);
      };
      const [role, setRole] = useState("");

      const handleRoleChange = (event) => {
        setRole(event.target.value);
      };
    
      const handleSubmit = (event) => {
        event.preventDefault();
        // Handle login logic based on the selected role
        if (role === "student") {
          // Logic for student login
          console.log("Student login");
        } else if (role === "admin") {
          // Logic for admin login
          console.log("Admin login");
        } else {
          // No role selected
          console.log("Please select a role");
        }
      };
  return (
    <div className='parent'>
      <div className='parent-back'>
            <div className='back-log'>
                <h1>&lt;FE<span>N</span>OTE&gt;</h1>
            </div>
      </div>
      <div className='parent-log'>
        <div className='def' onSubmit={handleSubmit}>
            <div className='def1'> 
                <label>
                    Student
                    <br />
                    <input type="radio" value="student"checked={role === "student"}
                    onChange={handleRoleChange}
                    />
                </label>
            </div>
            <div className='def2'>
                <label>
                    Admin
                    <br />
                    <input type="radio" value="admin" checked={role === "admin"} onChange={handleRoleChange}
                    />
                </label>
            </div>
        </div>
        <h2>Welcome Back!</h2>
            <div className='login'>
                <form>
                    <label>
                        Username:<br/>
                        <input type="email" placeholder="Ex.jhondoe" />
                    </label>
                    <label>
                        Password<br/>
                        <input type={toggle ? "text" : "password"} placeholder='********'/>
                        <i class={toggle? "far fa-eye-slash" : "far fa-eye"} onClick={togglePasswordVisibility}></i><br/>
                        <span ></span>
                        {/* <small style={{color:"red"}}>*This field is required.</small><br/> */}
                        <p><Link to="/">Forgot password?</Link></p>
                    </label>
                    <button type="submit">Login</button>
                </form>
            </div>
        <div className='next'>
            <p>Not a member?<Link to="/signup">Sign up now</Link></p>
        </div>
        </div>
      </div>
  )
}

export default Signin
