import './App.css'
import { Routes, Route } from 'react-router-dom';
import Overlay from './pages/overlay.jsx';
import Register from './pages/register.jsx';
import Home from './pages/home.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';

function App() {

  return (
    <Routes>
      <Route path='/' element={<AuthLayout />}>
        <Route path='' element={<Overlay />} />
        <Route path='registrar' element={<Register />} />
      </Route>
      <Route path='/club-manager' element={<MainLayout />}>
        <Route path='home' element={<Home />} />
      </Route>
    </Routes>
  )
}

export default App
