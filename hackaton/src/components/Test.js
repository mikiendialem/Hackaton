import React, { useState } from 'react';
import "./Test.css";
function Test() {
  const [inputValues, setInputValues] = useState({
    input1: '',
    textarea1: '',
    input2: '',
    input3: '',
    textarea2: '',
    input4: ''
    
  });

  const handleInputChange = (event) => {
    setInputValues({
      ...inputValues,
      [event.target.name]: event.target.value
    });
  };

  return (
    <div className='app'>

      <div class="navbar">
      <span class="website-name">FENOTE</span>
     <div className='nav'>
      <a href="#">Courses</a>
      <a href="#" class="active">Test</a>
      <a href="#">Visibility</a>
     </div>
    </div>
         <h3>Upload Test</h3>
       <div className='Container'>
      <input
        type="text"
        name='input2'
        id="input1"
        placeholder="Enter the title of the test here"
        value={inputValues.input1}
        onChange={handleInputChange}
      />
       <textarea
        id="textarea1"
        name="textarea1"
        rows="4"
        cols="50"
        placeholder="this video will tech you about........"
        value={inputValues.textarea1}
        onChange={handleInputChange}
      ></textarea>
      <input
        type="text"
        name='input2'
        id="input2"
        placeholder="Enter the link of the test file here "
        value={inputValues.input2}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name='input3'
        id="input3"
        placeholder="Enter the title of the test here "
        value={inputValues.input3}
        onChange={handleInputChange}
      />
      <textarea
        id="textarea2"
        name="textarea2"
        rows="4"
        cols="50"
        placeholder="this video will tech you about........"
        value={inputValues.textarea2}
        onChange={handleInputChange}
      ></textarea>
      <input
        type="text"
        id="input4"
        name="input4"
        placeholder="Enter input 4"
        value={inputValues.input4}
        onChange={handleInputChange}
      />
      <div className='hr'>
         <hr/>
         <hr/>
      </div>
      </div>
     
        </div>
  );
}

export default Test;
