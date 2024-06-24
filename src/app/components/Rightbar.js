import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Rightbar = () => {
    const rightsidebar = (e) => {
        e.preventDefault();
        document.body.classList.remove("right-bar-enabled");
    };

    return (
        <>
            <div className="right-bar">
                <div className="rightbar-title d-flex align-items-center px-3 py-4">
                    <h5 className="m-0 me-2">Settings</h5>
                    <a href="/" className="right-bar-toggle ms-auto" onClick={rightsidebar}>
                        <i className="mdi mdi-close noti-icon" />
                    </a>
                </div>

                <div id="sidebar-menu">
                    <ul className="metismenu list-unstyled" id="side-menu">
                        <li className="menu-title">Menu</li>
                        <li>
                            <Link href={'/Tags'}>
                                <i className=" ri-price-tag-3-fill"></i>
                                <span className="badge rounded-pill bg-success float-end">3</span>
                                <span>Tags</span>
                            </Link>
                        </li>
                        <li>
                            <Link href={'RolePerms'}>
                                <i className=" ri-price-tag-3-fill"></i>
                                <span className="badge rounded-pill bg-success float-end">3</span>
                                <span>Role Permissions</span>
                            </Link>
                        </li>
                    </ul>
                </div>

            </div>
        </>
    );
};

export default Rightbar;
