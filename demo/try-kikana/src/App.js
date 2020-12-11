import React, {useState} from 'react';
import toHiragana from '../../../src/toHiragana'
import cyrillicToHiragana from '../../../src/cyrillicToHiragana'
import './App.css';

function App() {
  const [input, setInput] = useState("");
  const [secondInput, setSecondInput] = useState("");
  const [englishInput, setEnglishInput] = useState("");

  return (
    <div className="App">
      <input
      type="text"
      value={input}
      onChange={change => setInput(change.target.value) }>
      </input>
      {cyrillicToHiragana(input)}
      <br></br>
      <input 
      type="text"
      value={cyrillicToHiragana(secondInput)}
      onChange={change => setSecondInput(change.target.value) }>
      </input>
      <br></br>
      <input 
      type="text"
      value={toHiragana(englishInput)}
      onChange={change => setEnglishInput(change.target.value) }>
      </input>
    </div>
  );
}

export default App;