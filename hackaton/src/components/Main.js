import React, { useState } from 'react';
// import {Link} from 'react-router-dom';
import './Main.css';

function Main() {
  const [inputValues, setInputValues] = useState({
    input1: '',
    input2: '',
    textarea1: '',
    input3: '',
    textarea2: '',
    input4: '',
    textarea3: '',
  });

  const handleInputChange = (event) => {
    setInputValues({
      ...inputValues,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <div className='all'>
    <div class="navbar">
          <div className='child-back-log'>
            <h1>&lt;FE<span>N</span>OTE&gt;</h1>
          </div>
          <div className='nav'>
            <p>Course</p>
            <p>Test</p>
            <p>Visibility</p>
          </div>
    </div>
    <h3>Upload Test</h3>
      <div className='Container'>
        <div className='one'>
            <div className='box1'></div>
            <div>
                <small style={{color:"red"}}>*Title.</small><br/>
                <input type="text" name="input1"placeholder='HTML' value={inputValues.input1} onChange={handleInputChange}/>
            </div>
        </div>
        <div className='two'>
          <div className='box2'></div>
          <input type="text" name="input2" placeholder='Enter your title' value={inputValues.input2} onChange={handleInputChange}/>
          <textarea name="textarea1" placeholder='This video will teach you about ......'value={inputValues.textarea1} onChange={handleInputChange}/>
        </div>
        <div className='three'>
            <div className='box3'></div>
            <input type="text" name="input3" placeholder='Enter your title' value={inputValues.input3} onChange={handleInputChange}/>
            <textarea name="textarea2" placeholder='This video will teach you about ......' value={inputValues.textarea2} onChange={handleInputChange}/>
        </div>
        <div className='four'>
            <div className='box4'></div>
            <input type="text" name="input4" placeholder='Enter your title' value={inputValues.input4} onChange={handleInputChange}/>
            <textarea name="textarea3" placeholder='This video will teach you about ......' value={inputValues.textarea3} onChange={handleInputChange}/>
        </div>
        </div>
    </div>
  );
}

export default Main;
