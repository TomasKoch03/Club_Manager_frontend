import './App.css'
import { Routes, Route } from 'react-router-dom';
import Overlay from './pages/overlay.jsx';
import Register from './pages/register.jsx';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Overlay />} />
      <Route path='/registrar' element={<Register />} />
    </Routes>
  )
}

export default App
