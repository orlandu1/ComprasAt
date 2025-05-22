import { useState } from 'react'
import AppRoutes from './Routes/AppRoutes'
import { BrowserRouter } from 'react-router-dom'
import SideBar from './Components/SideBar/SideBar';
import { AuthProvider } from './Context/AuthContext';

function App() {


  return (
    <>
      <div>
        <BrowserRouter>
          <AuthProvider>
            <div className="flex grid-cols-2">
              <SideBar />
              <AppRoutes />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </div >
    </>
  )
}

export default App
