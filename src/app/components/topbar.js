"use client";
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import TokenDecoder from "./Cookies";
import Link from 'next/link';

const Topbar = () => {
  const [isBodyClassActive, setIsBodyClassActive] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const userdata = TokenDecoder();
  const userid = userdata ? userdata.id : null;
  const username = userdata ? userdata.name : null;
  const avtaar = userdata ? userdata.avatar : null;
  const userrole = userdata ? userdata.role : null;
  console.log(userdata);
  console.log(avtaar,"avtaar");
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(max-width: 768px)");

      const handleMediaQueryChange = (e) => {
        setIsMobileScreen(e.matches);
      };

      handleMediaQueryChange(mediaQuery);
      mediaQuery.addListener(handleMediaQueryChange);

      return () => {
        mediaQuery.removeListener(handleMediaQueryChange);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const body = document.querySelector('body');
      if (body) {
        if (isBodyClassActive) {
          body.classList.add("sidebar-enable", "vertical-collpsed");
        } else {
          body.classList.remove('vertical-collpsed');
        }
      }
    }
  }, [isBodyClassActive]);

  useEffect(() => {
    if (isMobileScreen) {
      if (isBodyClassActive) {
        document.body.classList.remove("vertical-collpsed");

        document.body.classList.add("sidebar-enable");
      } else {
        document.body.classList.remove("sidebar-enable");
      }
      document.body.classList.remove("vertical-collapsed");
    } else {
      document.body.classList.remove("sidebar-enable");
      if (!isBodyClassActive) {
        document.body.classList.add("vertical-collapsed");
      } else {
        document.body.classList.remove("vertical-collapsed");
      }
    }
  }, [isBodyClassActive, isMobileScreen]);

  function handleButtonClick() {
    setIsBodyClassActive((prev) => !prev);
  }
  const rightsidebar = () => {
    document.body.classList.add("right-bar-enabled");
  };
  return (
    <header id="page-topbar" className={`!z-[99]`}>
      <div className="navbar-header">
        <div className="d-flex">
          {/* LOGO */}
          <div className="navbar-brand-box">
          <Link href={'/profile'}  className="logo logo-dark">
             <span className="logo-sm mt-4">
                <img
                  src="/logo.png"
                  alt="logo-sm-dark"
                  className="!h-[20px] !max-w-fit"
                />
              </span>
              <span className="logo-lg">
                <img
                  src="/logo.png"
                  alt="logo-sm-dark"
                  height={70}
                />
              </span>
              
            </Link>
            <Link href={'/profile'}  className="logo logo-light">
             <span className="logo-sm">
                <img
                  src="/logo.png"
                  alt="logo-sm-dark"
                  height={22}
                />
              </span>
              
            </Link>
          
             
          </div>
          <button
            type="button"
            className="btn btn-sm px-3 font-size-24 header-item waves-effect" onClick={handleButtonClick}
            id="vertical-menu-btn"
          >
            <i className="ri-menu-2-line align-middle" />
          </button>
          {/* App Search*/}
         
        </div>
        <div className="d-flex">
          <div className="dropdown d-inline-block d-lg-none ms-2">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              id="page-header-search-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="ri-search-line" />
            </button>
            <div
              className="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0"
              aria-labelledby="page-header-search-dropdown"
            >
              <form className="p-3">
                <div className="mb-3 m-0">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search ..."
                    />
                    <div className="input-group-append">
                      <button className="btn btn-primary" type="submit">
                        <i className="ri-search-line" />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="dropdown d-none d-lg-inline-block ms-1">
            <button
              type="button"
              className="btn header-item noti-icon waves-effect"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="ri-apps-2-line" />
            </button>
            <div className="dropdown-menu dropdown-menu-lg dropdown-menu-end">
              <div className="px-lg-2">
                <div className="row g-0">
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img src="/assets/images/brands/github.png" alt="Github" />
                      <span>GitHub</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img
                        src="/assets/images/brands/bitbucket.png"
                        alt="bitbucket"
                      />
                      <span>Bitbucket</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img src="/assets/images/brands/dribbble.png" alt="dribbble" />
                      <span>Dribbble</span>
                    </a>
                  </div>
                </div>
                <div className="row g-0">
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img src="/assets/images/brands/dropbox.png" alt="dropbox" />
                      <span>Dropbox</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img
                        src="/assets/images/brands/mail_chimp.png"
                        alt="mail_chimp"
                      />
                      <span>Mail Chimp</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img src="/assets/images/brands/slack.png" alt="slack" />
                      <span>Slack</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="dropdown d-inline-block user-dropdown">
            <button
              type="button"
              className="btn header-item !flex !items-center waves-effect"
              id="page-header-user-dropdown"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {avtaar ? (
                
                 <Image
                className="rounded-circle header-profile-user"
                src={avtaar}
                alt="Header Avatar"
                width={30}
                height={30}
              />
              ) : (
                 <Image
                className="rounded-circle header-profile-user"
                src="/logo.png"
                alt="Header Avatar"
                width={30}
                height={30}
              />
              )}
              
              <span className="d-none d-xl-inline-block ms-1">{username}</span>
            </button>
            <div className="dropdown-menu dropdown-menu-end">
              {/* item*/}
              <a className="dropdown-item" href="#">
                <i className="ri-user-line align-middle me-1" /> Profile
              </a>
              <a className="dropdown-item" href="#">
                <i className="ri-wallet-2-line align-middle me-1" /> My Wallet
              </a>
              <a className="dropdown-item d-block" href="#">
                <span className="badge bg-success float-end mt-1">11</span>
                <i className="ri-settings-2-line align-middle me-1" /> Settings
              </a>
              <a className="dropdown-item" href="#">
                <i className="ri-lock-unlock-line align-middle me-1" /> Lock screen
              </a>
              <div className="dropdown-divider" />
              <a className="dropdown-item text-danger" href="#">
                <i className="ri-shut-down-line align-middle me-1 text-danger" />{" "}
                Logout
              </a>
            </div>
          </div>
          <div className="dropdown d-inline-block">
            <button
              type="button"
              className="btn header-item noti-icon right-bar-toggle waves-effect"
              onClick={rightsidebar}
            >
              <i className="ri-settings-2-line" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Topbar;
