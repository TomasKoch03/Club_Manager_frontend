import './App.css'
import { Routes, Route } from 'react-router-dom';
import Overlay from './pages/overlay.jsx';
import Register from './pages/register.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

function App() {

  return (
    <Routes>
      <Route path='/' element={<AuthLayout />}>
        <Route path='' element={<Overlay />} />
        <Route path='registrar' element={<Register />} />
      </Route>
    </Routes>
  )
}

export default App
