import { Route, Routes } from 'react-router-dom';
import './App.css';
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import BookingGrid from './pages/booking_grid.jsx';
import MyBookings from "./pages/my_bookings.jsx";
import Calendar from './pages/calendar.jsx';
import Home from './pages/home.jsx';
import AdminHome from "./pages/admin_home.jsx";
import AllBookings from "./pages/all_bookings.jsx";
import SelectUser from "./pages/select_user.jsx";
import Overlay from './pages/overlay.jsx';
import Register from './pages/register.jsx';

import CalendarAdmin from "./pages/calendar_admin_reservation.jsx";
import BookingGridAdmin from "./pages/booking_grid_admin_reservation.jsx";

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
      <Route path='/admin' element={<MainLayout />}>
        <Route path='home' element={<AdminHome />} />
        <Route path='reservas' element={<AllBookings />} />
        <Route path='reservar/:sport/selectUser' element={<SelectUser />} />
        <Route path='reservar/:sport/:userId/calendar' element={<CalendarAdmin />} />
        <Route path='reservar/:sport/:userId' element={<BookingGridAdmin />} />
      </Route>
    </Routes>
  )
}

export default App
