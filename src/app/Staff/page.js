"use client";
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import Calendar from '../components/calender';
import RootLayout from '../components/layout';
import Modal from '../components/modal';
import DocumentModal from '../components/doument';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function Staff() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [userPerPage, setUserPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');


    const toggleModal = (e,user = null) => {
        if (e) {
            e.preventDefault();
        }
          setSelectedUser(user);
        setIsModalOpen(!isModalOpen);
    };
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/staff/get');
                setUsers(response.data.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();

        return;
    }, []);
    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    console.log(filteredUsers);

   const toggleDocumentModal = (e, userId) => {
    setIsDocumentModalOpen(!isDocumentModalOpen);
    setSelectedUserId(userId);
};

    

    const downloadFile = async (fileUrl) => {
        try {
            const response = await axios.get(fileUrl, {
                responseType: 'blob', // important for downloading files
            });
            const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', fileUrl.substring(fileUrl.lastIndexOf('/') + 1));
            document.body.appendChild(link);
            link.click(); // This should trigger the download
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };
    const indexOfLastUser = currentPage * userPerPage;
    const indexOfFirstUser = indexOfLastUser - userPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const nextPage = () => {
        if (currentPage < Math.ceil(users.length / userPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (


        <RootLayout>
            {isModalOpen && <Modal setUsers={setUsers} userdata={selectedUser}  onClose2={toggleModal} />} {/* Render modal if isModalOpen is true */}
            {isDocumentModalOpen && <DocumentModal isOpen={isDocumentModalOpen} onClose={toggleDocumentModal} savedUser={selectedUserId} />}

            <div className='container-fluid'>
                <div className='row'>
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body">
                              <div className='row'>
                                    <div className="col-12 d-flex align-items-center justify-content-between">
                                        <h4 className="card-title">Staff Members</h4>
                                        <input type="text" style={{ width: '30%' }}    value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)} className="form-control" placeholder="Search..." />
                                    </div>
                                </div>

                                <div
                                    id="datatable_wrapper"
                                    className="dataTables_wrapper dt-bootstrap4 no-footer"
                                >
                                    <div className="row">
                                        <div className="col-sm-12">
                                            <div className="table-responsive">
                                                <table className="table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Role</th>
                                                            <th>Documents</th>
                                                            <th>Upload Document</th>
                                                             <th>Edit</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                       {currentUsers.map((user, index) => (
                                                            <tr key={user._id}>
                                                                <th scope="row">{index  + 1}</th>
                                                                <td>{user.username}</td>
                                                                <td>{user.email}</td>
                                                                <td>{user.Phone}</td>
                                                                <td>{user.Role}</td>
                                                                <td>
                                                                    {user.documents ? (
                                                                        <div className="dropdown">
                                                                            <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                                                                Select Document
                                                                            </button>
                                                                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                                                                {user.documents.split(',').map((document, index) => (
                                                                                    <li key={index}>
                                                                                        <a className="dropdown-item" href={`/documents/${document.trim()}`} download>{document.trim()}</a>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ) : (
                                                                        <h6>Please Upload Document</h6>
                                                                    )}
                                                                </td>
                                                                 <td><i className='ri-upload-cloud-2-fill f-24' onClick={(e) => toggleDocumentModal(e, user._id)}></i></td>

                                                                <td><button className="btn btn-warning" onClick={(e) => toggleModal(e, user)}>Edit</button></td>


                                                                {/* <td>
                                                                    <div className="form-check form-switch mb-3" dir="ltr">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-check-input"
                                                                            id={`customSwitch${index}`}
                                                                            defaultChecked={user.active}
                                                                        />
                                                                    </div>
                                                                </td> */}

                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>
                                    </div>
                              <div className="row">
                                        <div className="col-sm-12 col-md-12">
                                            <div className="dataTables_info" id="datatable_info" role="status" aria-live="polite">
                                                Showing {currentPage * userPerPage - userPerPage + 1} to{' '}
                                                {Math.min(currentPage * userPerPage, users.length)} of {users.length}{' '}
                                                entries
                                            </div>
                                        </div>
                                        <div className="col-sm-12 col-md-12">
                                            <div className="dataTables_paginate paging_simple_numbers" id="datatable_paginate">
                                                <ul className="pagination pagination-rounded">
                                                    <li className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''}`} id="datatable_previous">
                                                        <a href="#" aria-controls="datatable" aria-disabled={currentPage === 1} role="link" data-dt-idx="previous" tabIndex={0} className="page-link" onClick={prevPage}>
                                                            <i className="mdi mdi-chevron-left" />
                                                        </a>
                                                    </li>
                                                    {Array.from({ length: Math.ceil(users.length / userPerPage) }, (_, i) => (
                                                        <li key={i} className={`paginate_button page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                                                            <a href="#" aria-controls="datatable" role="link" aria-current={i + 1 === currentPage ? 'page' : null} data-dt-idx={i} tabIndex={0} className="page-link" onClick={() => setCurrentPage(i + 1)}>
                                                                {i + 1}
                                                            </a>
                                                        </li>
                                                    ))}
                                                    <li className={`paginate_button page-item next ${currentPage === Math.ceil(users.length / userPerPage) ? 'disabled' : ''}`} id="datatable_next">
                                                        <a href="#" aria-controls="datatable" aria-disabled={currentPage === Math.ceil(users.length / userPerPage)} role="link" data-dt-idx="next" tabIndex={0} className="page-link" onClick={nextPage}>
                                                            <i className="mdi mdi-chevron-right" />
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Link
                    href="/"
                    className="float"
                    onClick={toggleModal}
                >
                    <i className="fa fa-plus my-float" />
                </Link>

            </div>


        </RootLayout>


    )
}

export default Staff
