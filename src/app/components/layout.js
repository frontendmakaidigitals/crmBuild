// RootLayout.js
"use client";
import React, { useState } from 'react';
import Cssfile from "./Cssfile";
import Jsfile from "./Scripts";
import Topbar from "./topbar";
import Sidebar from "./sidebar";
import LogoutInactiveUser from './LogoutInactiveUser';
import "../page.module.css"
import Rightbar from './Rightbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './Loader'; // Import the Loader component
export default function RootLayout({ children }) {
const [loading, setLoading] = useState(true);
 setTimeout(() => {
    setLoading(false);
  }, 2000);
  return (
     <>
      {loading && <Loader />} {/* Conditionally render the loader */}
      <div style={{ visibility: loading ? 'hidden' : 'visible', opacity: loading ? 0 : 1 }}>
        <Cssfile />
        <div data-sidebar="dark">
          <div id="layout-wrapper">
            <Topbar />
            <Sidebar />
            <div className='main-content'>
              <div className="page-content">
                <ToastContainer />
              
                {children}
              </div>
            </div>
            <Rightbar />
          </div>
        </div>
        <Jsfile />
      </div>
    </>
  );
}
