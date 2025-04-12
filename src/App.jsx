import { useState } from 'react'
import AppRoutes from './Routes/AppRoutes'
import { BrowserRouter } from 'react-router-dom'
import SideBar from './Components/SideBar/SideBar';

function App() {


  return (
    <>
      <div>
        <BrowserRouter>
          <div className='flex'>
            <SideBar />
            <AppRoutes />
          </div>
        </BrowserRouter>
      </div >
    </>
  )
}

export default App
