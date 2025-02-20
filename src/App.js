import { Browser } from 'leaflet';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Positioner from './Positioner';
import Science from './Science';

function App() {
  return (
   <BrowserRouter>
      <Routes>
        <Route path="/" element={<Positioner />} />
        <Route path="/science" element={<Science />} />
      </Routes>
   </BrowserRouter>
  )
}

export default App