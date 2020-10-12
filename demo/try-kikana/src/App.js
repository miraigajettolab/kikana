import React, {useState} from 'react';
import toHiragana from '../../../src/toHiragana'
import cyrillicToHiragana from '../../../src/cyrillicToHiragana'
import './App.css';

function App() {
  const [input, setInput] = useState("");

  return (
    <div className="App">
      <input 
      type="text"
      value={input}
      onChange={change => setInput(change.target.value) }>
      </input>
      {cyrillicToHiragana(input)}
    </div>
  );
}

export default App;
