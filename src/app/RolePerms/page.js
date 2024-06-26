"use client"
import React, { useEffect, useState } from 'react';
import RootLayout from '@/app/components/layout';
import SearchableSelect from '../Leads/dropdown';
import axios from 'axios';
function RolePerms() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState({});
    const [defaultperms, setDefaultPerms] = useState([]);

    const options1 = [
        { value: 'Admin', label: 'Admin' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'SalesHead', label: 'Slaes Head' },
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

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const response = await axios.get(`/api/rolepermison/${selectedRole}`);
                console.log(response.data.data);
                const groupedPermissions = {};
                response.data.data.forEach(permission => {
                    if (!groupedPermissions[permission.moduleName]) {
                        groupedPermissions[permission.moduleName] = [];
                    }
                    groupedPermissions[permission.moduleName].push(permission);
                });
                setDefaultPerms(groupedPermissions);
            } catch (error) {
                console.error(error);
            }
        };

        if (selectedRole) {
            fetchPermissions();
        }
    }, [selectedRole]);

    const updatePermissions = async () => {
        try {
            const response = await axios.put(`/api/rolepermison/update/${selectedRole}`, { permissions: permissions });
            console.log('Permissions updated successfully');
        } catch (error) {
            console.error(error);
        }
    };

    const handleTogglePermission = (module, permission) => {
        const updatedPermissions = { ...permissions };
        if (!updatedPermissions[module]) {
            updatedPermissions[module] = {};
        }
        updatedPermissions[module][permission] = !updatedPermissions[module][permission];
        setPermissions(updatedPermissions);
    };

    return (
        <RootLayout>
            <div className='container'>
                <div className='row'>
                    <div className='col-md-12 bg-blue'>
                        <div>
                            <h6> Role Permissions</h6>
                        </div>
                    </div>
                </div>
                <div className='row mt-4'>
                    <div className='col-md-6'>
                        <div className="mb-4">
                            <SearchableSelect options={options1} onChange={(selectedOption) => setSelectedRole(selectedOption.value)} placeholder="Select Role..." />
                        </div>
                        <div className="mb-4">
                            <div className="table-responsive">
                                <table className="table table-bordered roles no-margin">
                                    <thead>
                                        <tr>
                                            <th>Modules</th>
                                            <th>Permission</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(defaultperms).map((moduleName, index) => (
                                            <tr key={index} data-name={moduleName}>
                                                <td>
                                                    <b>{moduleName}</b>
                                                </td>
                                                <td>
                                                    {defaultperms[moduleName].map((permission, idx) => (
                                                        <div className="checkbox" key={idx}>
                                                            <div className="form-check form-switch mb-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`customSwitch-${moduleName}-${idx}`}
                                                                    onClick={() => handleTogglePermission(moduleName, permission.permissionName)}
                                                                    defaultChecked={permission.value === true ? true : false}
                                                                />
                                                                <label className="form-check-label" htmlFor={`customSwitch-${moduleName}-${idx}`}>
                                                                    {permission.permissionName}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            </div>

                        </div>
                        <div className='mt-2 mb-4'>
                            <button className='btn btn-primary' onClick={updatePermissions}>Save Permission</button>
                        </div>
                    </div>
                </div>
            </div>

        </RootLayout>
    );
};



export default RolePerms;
