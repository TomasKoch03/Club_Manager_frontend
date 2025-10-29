import { Route, Routes } from 'react-router-dom';
import './App.css';
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import BookingGrid from './pages/booking_grid.jsx';
import MyBookings from "./pages/my_bookings.jsx";
import Calendar from './pages/calendar.jsx';
import Home from './pages/home.jsx';
import Overlay from './pages/overlay.jsx';
import Register from './pages/register.jsx';

function App() {

  return (
    <Routes>
      <Route path='/' element={<AuthLayout />}>
        <Route path='' element={<Overlay />} />
        <Route path='registrar' element={<Register />} />
      </Route>
      <Route path='/club-manager' element={<MainLayout />}>
        <Route path='home' element={<Home />} />
        <Route path='mis-reservas' element={<MyBookings />} />
        <Route path='reservar/:sport/calendario' element={<Calendar />} />
        <Route path='reservar/:sport' element={<BookingGrid />} />
      </Route>
    </Routes>
  )
}

export default App
