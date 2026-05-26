import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Header from '../components/header'
import HomePage from '../pages/home'
import LoginPage from '../pages/loginPage'
import NotFoundPage from '../pages/notFoundPage'
import AdminPage from '../pages/adminPage'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"      element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/*" element={<AdminPage/>} />
        <Route path="*"      element={<NotFoundPage />} />
       
      </Routes>
    </BrowserRouter>
  )
}

export default App