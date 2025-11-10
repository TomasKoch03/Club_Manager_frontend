import { Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastProvider } from './components/ToastContainer.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AdminHome from "./pages/admin_home.jsx";
import AllBookings from "./pages/all_bookings.jsx";
import BookingGrid from './pages/booking_grid.jsx';
import Calendar from './pages/calendar.jsx';
import EditUser from "./pages/edit_user.jsx";
import Home from './pages/home.jsx';
import ManageUsers from "./pages/manage_users.jsx";
import MyBookings from "./pages/my_bookings.jsx";
import Overlay from './pages/overlay.jsx';
import Profile from './pages/profile.jsx';
import Register from './pages/register.jsx';
import SelectUser from "./pages/select_user.jsx";

function App() {

  return (
    <ToastProvider>
      <Routes>
        <Route path='/' element={<AuthLayout />}>
          <Route path='' element={<Overlay />} />
          <Route path='registrar' element={<Register />} />
        </Route>
        <Route path='/club-manager' element={<MainLayout />}>
          <Route path='home' element={<Home />} />
          <Route path='perfil' element={<Profile />} />
          <Route path='mis-reservas' element={<MyBookings />} />
          <Route path='reservar/:sport/calendario' element={<Calendar />} />
          <Route path='reservar/:sport' element={<BookingGrid />} />
        </Route>
        <Route path='/admin' element={<MainLayout />}>
          <Route path='home' element={<AdminHome />} />
          <Route path='perfil' element={<Profile />} />
          <Route path='reservas' element={<AllBookings />} />
          <Route path='usuarios' element={<ManageUsers />} />
          <Route path='usuarios/:userId/edit' element={<EditUser />} />
          <Route path='reservar/:sport/selectUser' element={<SelectUser />} />
          <Route path='reservar/:sport/:userId/calendar' element={<Calendar />} />
          <Route path='reservar/:sport/:userId' element={<BookingGrid />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

export default App
