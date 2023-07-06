import React, { useState } from 'react';
import "./visibility.css"

function Visibility() {
  const [selectedOption, setSelectedOption] = useState('');

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  return (
    <div className='all'>
       <div class="navbar">
      <span class="website-name">FENOTE</span>
     <div className='nav'>
      <a href="#">Courses</a>
      <a href="#" >Test</a>
      <a href="#" class="active">Visibility</a>
     </div>
    </div>
      <h3>Submit the course</h3>
      <div className='box'>
        <div>
          <p>Choose when to publish and who can see your video</p>
        </div>
        <div className='one'> 
          <label>
            <input
              type="radio"
              name="submit"
              value="Save as Draft"
              checked={selectedOption === 'Save as Draft'}
              onChange={handleOptionChange}
            />
            Save as Draft
            <span>change</span>
          </label>
        </div>
        <div className='two'>
          <label>
            <input
              type="radio"
              name="submit"
              value="publish the course"
              checked={selectedOption === 'publish the course'}
              onChange={handleOptionChange}
            />
            Publish the course
            <span>chage</span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default Visibility;
