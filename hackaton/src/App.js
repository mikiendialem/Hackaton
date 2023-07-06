import React from 'react';
import { BrowserRouter as Router,Routes,Route } from 'react-router-dom';
import Home from './components/Home'
import About from './components/About'
import Course from './components/Course'
import Contact from './components/Contact'
import All from './components/All'
import Signin from './components/Signin';
import Signup from './components/Signup';


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<All/>}/>
        <Route path="/home" element={<Home />}/>
        <Route path="/about" element={<About />}/>
        <Route path="/course"  element={<Course/>}/>
        <Route path="/contact" element={<Contact/>}/>
        <Route path='/signin' element={<Signin/>}/>
        <Route path='/signup' element={<Signup/>}/>
      </Routes> 
    </Router>
  );
}

export default App;
