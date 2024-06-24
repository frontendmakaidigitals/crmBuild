import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from '../Modal.module.css';
import axios from 'axios';
import SearchableSelect from '../Leads/dropdown';
import 'bootstrap/dist/css/bootstrap.css';
import { useDropzone } from 'react-dropzone';
import DocumentModal from './doument';

const Modal = ({ setUsers,onClose2,userdata }) => {
    const [showModal, setShowModal] = useState(true);
    const [savedUser, setSavedUser] = useState(null);
    const [parentStaff, setParentStaff] = useState([]);
    const [userid, setuserid] = useState(null);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false); 
    const toggleDocumentModal = () => {
        setIsDocumentModalOpen(!isDocumentModalOpen);
    };
    const options1 = [
        { value: 'Admin', label: 'Admin' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Manager', label: 'Manager' },
        { value: 'Finance', label: 'Finance' },
        { value: 'Operations', label: 'Operations' },
        { value: 'HR', label: 'Human Resource' },
        { value: 'BussinessHead', label: 'Bussiness Head' },
        { value: 'PNL', label: 'PNL' },
        { value: 'TL', label: 'TL' },
        { value: 'ATL', label: 'ATL' },
        { value: 'FOS', label: 'FOS' },
    ]
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        personalemail: '',
        Phone: '',
        Role: '',
        password: '',
        file: null,
        filePreview: null,
        PrentStaff: '',
    });
      useEffect(() => {
        if (userdata) {
            setFormData({
                username: userdata.username || '',
                email: userdata.email || '',
                personalemail: userdata.personalemail || '',
                Phone: userdata.Phone || '',
                Role: userdata.Role || '',
                password: userdata.password || '',
                file: userdata.Avatar || null,
                filePreview: userdata.Avatar || null,
                PrentStaff: userdata.PrentStaff || '',
            });
        }
    }, [userdata]);

    const handleSelectChange = (field, selectedOption) => {
        setFormData(prevrole => ({
            ...prevrole,
            [field]: selectedOption.value
        }));
    };
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`/api/staff/get`);
                let filteredUsers = [];
                if (formData.Role === 'Finance' || formData.Role === 'Operations' || formData.Role === 'HR' || formData.Role === 'BussinessHead') {
                    filteredUsers = response.data.data.filter(user => user.Role === 'Admin');
                } else {
                    const selectedRoleIndex = options1.findIndex(option => option.value === formData.Role);
                    filteredUsers = response.data.data.filter(user => {
                        const userRoleIndex = options1.findIndex(option => option.value === user.Role);
                        return userRoleIndex === selectedRoleIndex - 1; // Show only users with roles one level above the selected role
                    });
                }

                const mappedUsers = filteredUsers.map(user => ({ value: user._id, label: user.username }));
                setParentStaff(mappedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        if (formData.Role) {
            fetchUsers();
        }
    }, [formData.Role]);

    const [loading, setLoading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        accept: 'image/*',
        onDrop: acceptedFiles => {
            const file = acceptedFiles[0];
            const reader = new FileReader();
            reader.onload = () => {
                setFormData(prevData => ({
                    ...prevData,
                    file: file,
                    filePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const imageData = formData.filePreview.split(',')[1];
            const response = await axios.post('/api/staff/add', {
                ...formData,
                image: imageData,
                PrentStaff: formData.PrentStaff // Use PrentStaff as the key
            });
            setSavedUser(response.data.savedUser);
            setuserid(response.data.savedUser._id);
            setShowModal(false); // Close the Modal
            setIsDocumentModalOpen(true);
            setUsers(prevUsers => [...prevUsers, response.data.savedUser]); // Update the list of users

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);

        }
    };
    
    
     const handleUpdate = async () => {
        try {
            setLoading(true);
           let imageData;
                if (formData.filePreview) {
                    imageData = formData.filePreview.split(',')[1];
                } else {
                    imageData = userdata.Avatar;
                }
                
            const response = await axios.put(`/api/staff/update/${userdata._id}`, {
                ...formData,
                image: imageData,
                PrentStaff: formData.PrentStaff // Use PrentStaff as the key
            });
            setSavedUser(response.data.savedUser);
            setuserid(response.data.savedUser._id);
            setShowModal(false); // Close the Modal
            setIsDocumentModalOpen(true);
            setUsers(prevUsers => [...prevUsers, response.data.savedUser]); // Update the list of users
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            {showModal && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <span className={styles.closeButton} onClick={onClose2}>
                            &times;
                        </span>
                        <h4 className='text-center'>{loading ? "processing" : "Add Staff"}</h4>
                        <div className="card-body mt-4 p-0">
                            <div className='container'>
                                <div className='row'>
                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <input className="form-control" type="text" placeholder="Name" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                                    </div>
                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <input className="form-control" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <input className="form-control" type="email" placeholder="Personal Email" value={formData.personalemail} onChange={(e) => setFormData({ ...formData, personalemail: e.target.value })} />
                                    </div>


                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <input className="form-control" type="tel" placeholder="Phone" value={formData.Phone} onChange={(e) => setFormData({ ...formData, Phone: e.target.value })} />
                                    </div>
                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <div className="input-group" {...getRootProps()}>
                                            <input {...getInputProps()} />
                                            <div className="form-control">Drag 'n' drop an image here, or click to select image</div>
                                        </div>
                                    </div>
                                    {formData.filePreview && (
                                        <div className="mb-4 col-sm-12 col-xl-6">
                                            <img src={formData.filePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                                        </div>
                                    )}
                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <SearchableSelect options={options1} onChange={(selectedOption) => handleSelectChange('Role', selectedOption)} placeholder="Role..." />
                                    </div>
                                    {formData.Role && (
                                        <div className="mb-4 col-sm-12 col-xl-6">
                                            <SearchableSelect options={parentStaff} onChange={(selectedOption) => handleSelectChange('PrentStaff', selectedOption)} placeholder="Parent Staff..." />
                                        </div>
                                    )}

                                    <div className="mb-4 col-sm-12 col-xl-6">
                                        <input className="form-control" type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    </div>

                                               <div className="mb-4">
                                            {userdata ? (
                                                <button className='btn btn-primary w-100' onClick={handleUpdate}>Update</button>
                                            ) : (
                                                <button className='btn btn-primary w-100' onClick={handleSubmit}>Submit</button>
                                            )}
                                        </div>


                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            )}
            <div>
                {isDocumentModalOpen && (
                    <DocumentModal isOpen={isDocumentModalOpen} onClose={() => setIsDocumentModalOpen(false)} savedUser={userid} />
                )}
            </div>
        </>
    );
};

export default Modal;
