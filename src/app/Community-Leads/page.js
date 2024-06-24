"use client";
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import RootLayout from '@/app/components/layout';
import Excelmodal from '../Leads/excelmodal';
import BulkModal from '../components/bulk';
import MeetingModal from '../components/meetingmodal';
import ReminderModal from '../components/Remindermodal';
import ParsedDataTable from '../excel/page';
import SearchableSelect from '../Leads/dropdown';
import TokenDecoder from '../components/Cookies';
import Remindershowmodal from '../components/remindershow';
import Meetingshowmodal from '../components/meetingshow';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import DateRangePicker from '../components/date-range'
import Image from 'next/image';
function Cold() {
    const [toastShown, setToastShown] = useState(false);
    const [Leadss, setLead] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [leadsPerPage, setleadsPerPage] = useState(50);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpen2, setIsModalOpen2] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [longPressTimeout, setLongPressTimeout] = useState({});
    const [longPressedLeadId, setLongPressedLeadId] = useState(null);
    const [editLeadId, setEditLeadId] = useState(null);
    const [leadid, setLeadId] = useState('');
    const [parsedData, setParsedData] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [remindershow, setremindershow] = useState(false);
    const [meetingshow, setmeetingshow] = useState(false);
    const [TagsCount, setTagsCount] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [selecteduser, setselecteduser] = useState(null);
    const [totalLeads, setTotalLeads] = useState(0);

    const router = useRouter();
    const userdata = TokenDecoder();
    const userid = userdata ? userdata.id : null;
    const userrole = userdata ? userdata.role : null;
    const fetchLead = async () => {
        try {
            let url = '';
            if (userrole === "Admin") {
                url = `/api/Lead/get?page=${currentPage}&limit=${leadsPerPage}`;
            }
            else if (userrole === "FOS") {
                url = `/api/Lead/FOS/${userid}`;
            }
            else if (userrole === "BussinessHead") {
                url = `/api/Lead/hiearchy?page=${currentPage}&limit=${leadsPerPage}?role=ATL&userid=${userid}`;
            }
            else if (userrole === "PNL") {
                url = `/api/Lead/hiearchy?page=${currentPage}&limit=${leadsPerPage}?role=PNL&userid=${userid}`;
            }
            else if (userrole === "TL") {
                url = `/api/Lead/hiearchy?page=${currentPage}&limit=${leadsPerPage}?role=TL&userid=${userid}`;
            }
            else if (userrole === "ATL") {
                url = `/api/Lead/hiearchy?page=${currentPage}&limit=${leadsPerPage}?role=ATL&userid=${userid}`;
            }

            const response = await axios.get(url);

            let filteredLeads = response.data.data;
            if (selectedTag) {
                filteredLeads = filteredLeads.filter(lead => lead.tags._id === selectedTag);
            }
            if (selecteduser) {
                filteredLeads = filteredLeads.filter(lead => lead.Assigned && lead.Assigned._id == selecteduser);
            }

            setLead(filteredLeads);
            setTotalLeads(response.data.totalLeads);

        } catch (error) {
            console.error('Error fetching leads:', error);
        }
    };


    useEffect(() => {
        fetchLead();
    }, [userrole, userid, selectedTag, selecteduser, leadsPerPage, currentPage]);
    const fetchDataAndDownloadExcel = async () => {
        try {
            const response = await axios.post(`/api/Lead/export/cold`);
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'leads.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const groupedLeads = useMemo(() => {
        if (!Leadss) return [];
        return Leadss.reduce((groups, lead) => {
            const phoneNumber = lead.Phone;
            if (!groups[phoneNumber]) {
                groups[phoneNumber] = [];
            }
            groups[phoneNumber].push(lead);
            return groups;
        }, {});
    }, [Leadss]);

    const keys = Object.keys(groupedLeads);
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = Leadss ? Leadss.slice(indexOfFirstLead, indexOfLastLead) : [];

    // Change page
    const changePage = async (pageNumber) => {
        setCurrentPage(pageNumber);
        await fetchLead(pageNumber);
    };

    // Change page
    const nextPage = () => {
        const nextPageNumber = currentPage + 1;
        if (nextPageNumber <= Math.ceil(totalLeads / leadsPerPage)) {
            changePage(nextPageNumber);
        }
    };

    // Previous page
    const prevPage = () => {
        const prevPageNumber = currentPage - 1;
        if (prevPageNumber >= 1) {
            changePage(prevPageNumber);
        }
    };


    const openexcelmodal = () => {

        setIsModalOpen(!isModalOpen);
    };
    const openbulkModal = () => {

        setIsModalOpen2(!isModalOpen2);
    };
    const handleLongPressStart = (leadId) => {
        const timeoutId = setTimeout(() => {
            setSelectedLeads(prevSelectedLeads => {
                if (prevSelectedLeads.includes(leadId)) {
                    return prevSelectedLeads.filter(id => id !== leadId);
                } else {
                    return [...prevSelectedLeads, leadId];
                }
            });
            setLongPressedLeadId(leadId);
        }, 500); // Adjust the time for long press as needed

        setLongPressTimeout(prevTimeouts => ({
            ...prevTimeouts,
            [leadId]: timeoutId
        }));
    };
    const handleLongPressEnd = (event, leadId) => {
        event.preventDefault();
        clearTimeout(longPressTimeout[leadId]);
        setLongPressTimeout(prevTimeouts => {
            delete prevTimeouts[leadId];
            return { ...prevTimeouts };
        });
        setLongPressedLeadId(null);
    };
    const handleSelectAll = () => {
        if (selectedLeads.length === currentLeads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(currentLeads.map(lead => lead._id));
        }
        setSelectAll(!selectAll);
    };

    const handleEditClick = (leadId) => {
        setEditLeadId(prevEditLeadId => prevEditLeadId === leadId ? null : leadId);
        setLeadId(leadId);

    };

    const options = [
        { value: 'Intrested', label: 'Intrested' },
        { value: 'Not Intrested', label: 'Not Intrested' },
        { value: 'New', label: 'New' },
        { value: 'Follow up', label: 'Follow up' },
        { value: 'Qualified', label: 'Qualified' },
        { value: 'Prospect', label: 'Prospect' },
        { value: 'RNR', label: 'RNR' },
        { value: 'Not Reachable', label: 'Not Reachable' },
        { value: 'RSPV', label: 'RSPV' },



    ];

    const [showModal, setShowModal] = useState(false);
    const [showReminderModal, setReminderModal] = useState(false);


    const handleButtonClick = () => {
        setShowModal(true);
    };
    const handleReminderClick = () => {
        setReminderModal(true);
    };
    const [Meeting, setMeetings] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (leadid) {
                    const response = await axios.get(`/api/Meeting/get/${leadid}`);
                    setMeetings(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching meetings:', error);
            }
        };

        if (leadid) {
            fetchData();
        }

    }, [leadid]);

    const [Reminders, setReminders] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (leadid) {
                    const response = await axios.get(`/api/Reminder/get/${leadid}`);
                    setReminders(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching meetings:', error);
            }
        };
        if (leadid) {
            fetchData();
        }
    }, [leadid]);

    const handleParse = (data) => {
        setParsedData(data);
    };
    useEffect(() => {
        const fetchTags = async () => {
            try {
                let url = `/api/tags/get`;
                const response = await axios.get(url);
                setTagsCount(response.data.data);
            } catch (error) {
                console.error('Error fetching Tags:', error);
            }
        };

        fetchTags();

    }, []);
    const tagOptions = TagsCount.map(tag => ({ label: tag.Tag, value: tag._id }));

    const options5 = [
        { value: '100', label: '100' },
        { value: '200', label: '200' },
        { value: '1000 ', label: '1000' },
    ];
    const updateLeadStatus = async (leadId, newStatus) => {
        try {
            await axios.put(`/api/Lead/status/${leadId}`, { status: newStatus });
            setLeadss(prevLeads => prevLeads.map(lead => lead._id === leadId ? { ...lead, LeadStatus: newStatus } : lead));
        } catch (error) {
            console.error('Error updating lead status:', error);
        }
    };
    const handleInvoiceClick = (leadId) => {
        setSelectedLeadId(leadId);
    };
    const remindershowtogle = () => {
        setremindershow(prevState => !prevState);
    };
    const meetingshowtogle = () => {
        setmeetingshow(prevState => !prevState);
    };
    const leadcountf = (value) => {
        setCurrentPage(1);
        setleadsPerPage(parseInt(value, 10));
    };
    const deleteSelectedLeads = async () => {
        try {
            await axios.delete(`/api/Lead/delete`, { data: { leadIds: selectedLeads } });
            window.location.reload();
        } catch (error) {
            console.error('Error deleting leads:', error);
        }
    };
    const baseUrl = "http://216.10.242.11:8080/"; // Your base URL





    const handleSubmission = () => {
        if (selectedLeads.length === 1) {
            const leadId = selectedLeads[0] ? selectedLeads[0].toString() : null;
            if (leadId) {
                window.location.href = `/Your-Deals/create?leadId=${leadId}`;
            } else {
                console.error('Lead ID is null.');
            }
        } else if (selectedLeads.length > 1) {
            toast.error('You have selected more than 1 Lead');
        } else {
            // Handle the case where no lead is selected
            toast.error("You Haven't Selected Any Lead");
        }
    };
    const handleSearchTermChange = (event) => {
        setSearchTerm(event.target.value);
    };
    const filteredLeads = Leadss ? Leadss.filter((lead) =>
        lead.Phone.toString() === searchTerm ||
        lead.Name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];


    useEffect(() => {
        if (userrole !== null) {
            const fetchUsers = async () => {
                try {
                    const response = await axios.get('/api/staff/get');

                    let filteredUsers = response.data.data;
                    if (userrole == 'BussinessHead') {
                        const PNLUsers = response.data.data.filter(user => user.Role === 'PNL' && user.PrentStaff === userid);
                        const PNLIds = PNLUsers.map(user => user._id);
                        const tlUsers = response.data.data.filter(user => user.Role === 'TL' && PNLIds.includes(user.PrentStaff));
                        const tlIds = tlUsers.map(user => user._id);
                        const atlUsers = response.data.data.filter(user => user.Role === 'ATL' && tlIds.includes(user.PrentStaff));
                        const atlIds = atlUsers.map(user => user._id);
                        const fosUsers = response.data.data.filter(user => user.Role === 'FOS' && atlIds.includes(user.PrentStaff));
                        filteredUsers = [...PNLUsers, ...tlUsers, ...atlUsers, ...fosUsers];
                    }
                    else if (userrole == 'TL') {
                        const atlUsers = response.data.data.filter(user => user.Role === 'ATL' && user.PrentStaff === userid);
                        const atlIds = atlUsers.map(user => user._id);
                        const fosUsers = response.data.data.filter(user => user.Role === 'FOS' && atlIds.includes(user.PrentStaff));
                        filteredUsers = [...atlUsers, ...fosUsers];
                    }
                    else if (userrole == 'PNL') {
                        const tlUsers = response.data.data.filter(user => user.Role === 'TL' && user.PrentStaff === userid);
                        const tlIds = tlUsers.map(user => user._id);
                        const atlUsers = response.data.data.filter(user => user.Role === 'ATL' && tlIds.includes(user.PrentStaff));
                        const atlIds = atlUsers.map(user => user._id);
                        const fosUsers = response.data.data.filter(user => user.Role === 'FOS' && atlIds.includes(user.PrentStaff));
                        filteredUsers = [...tlUsers, ...atlUsers, ...fosUsers];
                    }

                    else if (userrole == 'ATL') {
                        const fosUsers = response.data.data.filter(user => user.Role === 'FOS' && user.PrentStaff === userid);
                        filteredUsers = [...fosUsers];
                    }
                    else if (userrole == 'FOS') {
                        const fosUsers = response.data.data.filter(user => user.Role === 'FOS' && user._id === userid);
                        filteredUsers = [...fosUsers];
                    }
                    else if (userrole == 'Admin') {
                        filteredUsers = response.data.data;


                    }
                    filteredUsers = filteredUsers.filter(user => !['HR', 'Finance', 'Manager', 'Operations', 'Marketing', 'SalesHead'].includes(user.Role));

                    const username = response.data.data.find(user => user._id === userid)?.username || 'Default Username';
                    const defaultOption = { value: userid, label: username };
                    filteredUsers = filteredUsers.filter(user => user._id !== userid);

                    const mappedUsers = filteredUsers.length > 0 ?
                        [defaultOption, ...filteredUsers.map(user => ({ value: user._id, label: user.username }))] :
                        [defaultOption];


                    setUsers(mappedUsers);
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            };

            fetchUsers();
        }
    }, [userrole]);


    return (
        <RootLayout>

            <div className='container-fluid p-0'>
                <div className='row'>
                    <div className='col-md-12 bg-blue d-flex justify-content-between'>
                        <div>
                            <h6> Leads</h6>
                        </div>
                        <div className='d-flex'>
                            <div>
                                <input
                                    type="text"
                                    className="form-control mt-2"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={handleSearchTermChange}
                                />

                            </div>

                        </div>

                    </div>
                    <div className='d-view'>

                        <div className='d-flex justify-content-between mt-2'>
                            <div className='d-view'>
                                <DateRangePicker />
                            </div>
                            <div className='d-view'>
                                <SearchableSelect style={{ width: '100%' }} options={users} onChange={(selectedOption) => setselecteduser(selectedOption.value)} placeholder="Filter By...." />
                            </div>
                            <div className='d-view'>
                                <SearchableSelect style={{ width: '100%' }} options={tagOptions} onChange={(selectedOption) => setSelectedTag(selectedOption.value)} placeholder="Select Tags...." />
                            </div>
                            <div>
                                <SearchableSelect
                                    options={options5}
                                    style={{ width: '100px' }}
                                    onChange={(selectedOption) => leadcountf(selectedOption.value)}
                                    placeholder="Show Leads..."
                                />
                            </div>

                        </div>
                    </div>
                    <div className='d-flex justify-content-between mt-2'>
                        <div className='btn-group'>
                            <div className='d-flex justify-content-between mt-2'>
                                <div>
                                    <button className="btn btn-primary" onClick={handleSubmission}>Submit Deal</button>

                                </div>


                                <div className='px-2'>
                                    <button className='btn btn-primary' onClick={openbulkModal}>Mapping</button>
                                </div>
                                <div className='px-2'>
                                    {selectedLeads.length > 0 && (
                                        <div className='d-flex'>
                                            <button className='btn btn-primary' onClick={handleSelectAll}>Select All</button>
                                        </div>
                                    )}
                                </div>
                                {userrole !== 'FOS' && (
                                    <>
                                        {selectedLeads.length > 0 && (
                                            <div className='d-flex'>
                                                <button className='btn btn-primary' onClick={deleteSelectedLeads}>Delete All</button>
                                            </div>
                                        )}
                                    </>
                                )}

                            </div>

                        </div>
                    </div>
                    <div className='m-view'>
                        <div className='d-flex justify-content-between mt-3'>

                            <div>
                                <SearchableSelect
                                    options={options5}
                                    style={{ width: '100px' }}
                                    onChange={(selectedOption) => leadcountf(selectedOption.value)}
                                    placeholder="Show Leads..."
                                />
                            </div>
                            <div>
                                <SearchableSelect options={tagOptions} onChange={(selectedOption) => setSelectedTag(selectedOption.value)} placeholder="Select Tag..." />
                            </div>
                        </div>
                        <div className='btn-group d-flex justify-content-between mt-2'>

                            <div>
                                <Link
                                    href={{
                                        pathname: '/Invoice/create',
                                        query: { leadId: selectedLeads.length === 1 ? selectedLeads[0] : null }
                                    }}
                                >

                                    <button className='btn btn-primary w-30 float-end'>Submit Deal</button>
                                </Link>
                            </div>
                            <div className='px-2'>
                                <button className='btn btn-primary' onClick={openbulkModal}>Lead Mapping</button>
                            </div>



                        </div>
                        <div className='btn-group d-flex justify-content-between mt-2'>

                            {selectedLeads.length > 0 && (
                                <div className=''>

                                    <div className='d-flex align-items-center'>
                                        <button className='btn btn-primary' onClick={handleSelectAll}>Select All</button>
                                    </div>

                                </div>
                            )}
                            {userrole !== 'FOS' && (
                                <>
                                    {selectedLeads.length > 0 && (
                                        <div className='d-flex align-items-center'>
                                            <button className='btn btn-primary' onClick={deleteSelectedLeads}>Delete All</button>
                                        </div>
                                    )}
                                </>
                            )}



                        </div>


                    </div>
                </div>

            </div>
            {isModalOpen && <Excelmodal onClose={openexcelmodal} onParse={handleParse} />}
            {isModalOpen && <Excelmodal onClose={openexcelmodal} onParse={handleParse} />}

            {parsedData && <ParsedDataTable data={parsedData} />}

            {isModalOpen2 && <BulkModal onClose={openbulkModal} selectedLeads={selectedLeads} />}
            <div className='container-fluid'>
                <div className='row mt-5'>
                    {searchTerm ? (
                        filteredLeads.length > 0 ? (
                            filteredLeads.map((currentLead) => (
                                // Render each filtered lead
                                <div className='col-md-4 card position-relative' key={currentLead._id} onMouseDown={() => handleLongPressStart(currentLead._id)} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd} onTouchStart={() => handleLongPressStart(currentLead._id)} onTouchEnd={handleLongPressEnd} style={{ background: selectedLeads.includes(currentLead._id) ? 'lightblue' : '#fff' }}>
                                    <div className='d-flex justify-content-between mt-3'>
                                        <div>
                                            <SearchableSelect
                                                options={options}
                                                onChange={(selectedOption) => {
                                                    const newStatus = selectedOption.value;
                                                    updateLeadStatus(currentLead._id, newStatus);
                                                }}
                                                defaultValue={currentLead.LeadStatus} // Set the default value here
                                                style={{
                                                    background: currentLead.LeadStatus === 'Not Intrested' ? "#fb555c" :
                                                        currentLead.LeadStatus === 'Intrested' ? "#0ac90b" : "#007eff", color: '#fff'
                                                }}
                                            />
                                        </div>
                                        <div className='d-flex justify-content-between'>
                                            {currentLead.Assigned && currentLead.Assigned.Avatar ? (
                                                <div>
                                                    <Image src={`${baseUrl}/${currentLead.Assigned.Avatar}`} style={{ width: '35px', height: '35px', borderRadius: '100%' }} alt="Image" width={100} height={100} />
                                                </div>
                                            ) : null}
                                            <div className="text-primary px-2">
                                                <a href={`tel:${currentLead.Phone}`}>
                                                    <i className="ri-phone-line custom-icon" />
                                                </a>
                                            </div>
                                            <div className="text-primary px-2">
                                                <a href={`https://wa.me/${currentLead.Phone}?text=Your%20custom%20message%20here`}>
                                                    <i className="ri-whatsapp-fill custom-icon2" />
                                                </a>
                                            </div>
                                            <div className="text-primary px-2" onClick={() => handleEditClick(currentLead._id)}>
                                                <i className="ri-edit-box-line custom-icon" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='mt-3'>
                                        <h4>{currentLead.Name} </h4>
                                        <hr />
                                    </div>
                                    <div className='mt-0'>
                                        <div>Marketing Tag: <span className='font-weight-800' style={{ fontWeight: '1500' }}>{currentLead.marketingtags.Tag}</span></div>
                                    </div>
                                    <div className='mt-0'>
                                        <div>DLD Tag: <span className='font-weight-800' style={{ fontWeight: '1500' }}>{currentLead.tags.Tag}</span></div>
                                    </div>
                                    <div className='mt-2'>
                                        <p className="mb-2 text-truncate" style={{ background: '#FFFDD0' }}>{currentLead.Description}</p>
                                        <hr />
                                    </div>
                                    {editLeadId === currentLead._id && (
                                        <>
                                            <div className='d-flex'>
                                                <div>
                                                    <p>Unit Number <span style={{ background: '#efefef', padding: '5px 20px', marginLeft: "15px" }}> {currentLead.unitnumber}</span></p>
                                                </div>
                                            </div>
                                            <div className='d-flex justify-content-between mt-3'>
                                                <div className='w-100'>
                                                    <p>Reminder <span className='circlebg' onClick={remindershowtogle}>{Reminders.length}</span></p>
                                                    <p className="mt-4" style={{ display: 'flex', alignItems: 'center' }} onClick={handleReminderClick}>Time & Date <i className='ri-calendar-2-line px-1'></i></p>
                                                    {showReminderModal && <ReminderModal onClose={() => setReminderModal(false)} lead={currentLead._id} />}
                                                    {remindershow && <Remindershowmodal onClose={remindershowtogle} lead={currentLead._id} />}
                                                </div>
                                                <div className='w-100'>
                                                    <p>Meetings <span className='circlebg' onClick={meetingshowtogle}>{Meeting.length}</span></p>
                                                    <p className="mt-4" style={{ display: 'flex', alignItems: 'center' }} onClick={handleButtonClick}>Add Meetings <i className=' ri-customer-service-2-line px-1'></i></p>
                                                    {showModal && <MeetingModal onClose={() => setShowModal(false)} lead={currentLead._id} />}
                                                    {meetingshow && <Meetingshowmodal onClose={meetingshowtogle} lead={currentLead._id} />}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No leads found for the given search term.</p>
                        )
                    ) : (
                        Array.isArray(Leadss) ? Leadss.map((currentLead) => (
                            <div className='col-md-4 card position-relative' key={currentLead._id} onMouseDown={() => handleLongPressStart(currentLead._id)} onMouseUp={handleLongPressEnd} onMouseLeave={handleLongPressEnd} onTouchStart={() => handleLongPressStart(currentLead._id)} onTouchEnd={handleLongPressEnd} style={{ background: selectedLeads.includes(currentLead._id) ? 'lightblue' : '#fff' }}>
                                {/* Render default leads */}
                                <div className='d-flex justify-content-between mt-3'>
                                    <div>
                                        <SearchableSelect
                                            options={options}
                                            onChange={(selectedOption) => {
                                                const newStatus = selectedOption.value;
                                                updateLeadStatus(currentLead._id, newStatus);
                                            }}
                                            defaultValue={currentLead.LeadStatus} // Set the default value here
                                            style={{
                                                background: currentLead.LeadStatus === 'Not Intrested' ? "#fb555c" :
                                                    currentLead.LeadStatus === 'Intrested' ? "#0ac90b" : "#007eff", color: '#fff'
                                            }}
                                        />
                                    </div>
                                    <div className='d-flex justify-content-between'>
                                        {currentLead.Assigned && currentLead.Assigned.Avatar ? (
                                            <div>
                                                <Image src={`${baseUrl}/${currentLead.Assigned.Avatar}`} style={{ width: '35px', height: '35px', borderRadius: '100%' }} alt="Image" width={100} height={100} />
                                            </div>
                                        ) : null}
                                        <div className="text-primary px-2">
                                            <a href={`tel:${currentLead.Phone}`}>
                                                <i className="ri-phone-line custom-icon" />
                                            </a>
                                        </div>
                                        <div className="text-primary px-2">
                                            <a href={`https://wa.me/${currentLead.Phone}?text=Your%20custom%20message%20here`}>
                                                <i className="ri-whatsapp-fill custom-icon2" />
                                            </a>
                                        </div>
                                        <div className="text-primary px-2" onClick={() => handleEditClick(currentLead._id)}>
                                            <i className="ri-edit-box-line custom-icon" />
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-3'>
                                    <h4>{currentLead.Name} </h4>
                                    <hr />
                                </div>
                                <div className='mt-0'>
                                    <div>Marketing Tag: <span className='font-weight-800' style={{ fontWeight: '1500' }}>{currentLead.marketingtags.Tag}</span></div>
                                </div>
                                <div className='mt-0'>
                                    <div>DLD Tag: <span className='font-weight-800' style={{ fontWeight: '1500' }}>{currentLead.tags.Tag}</span></div>
                                </div>
                                <div className='mt-2'>
                                    <p className="mb-2 text-truncate" style={{ background: '#FFFDD0' }}>{currentLead.Description}</p>
                                    <hr />
                                </div>
                                {editLeadId === currentLead._id && (
                                    <>
                                        <div className='d-flex'>
                                            <div>
                                                <p>Unit Number <span style={{ background: '#efefef', padding: '5px 20px', marginLeft: "15px" }}> {currentLead.unitnumber}</span></p>
                                            </div>
                                        </div>
                                        <div className='d-flex justify-content-between mt-3'>
                                            <div className='w-100'>
                                                <p>Reminder <span className='circlebg' onClick={remindershowtogle}>{Reminders.length}</span></p>
                                                <p className="mt-4" style={{ display: 'flex', alignItems: 'center' }} onClick={handleReminderClick}>Time & Date <i className='ri-calendar-2-line px-1'></i></p>
                                                {showReminderModal && <ReminderModal onClose={() => setReminderModal(false)} lead={currentLead._id} />}
                                                {remindershow && <Remindershowmodal onClose={remindershowtogle} lead={currentLead._id} />}
                                            </div>
                                            <div className='w-100'>
                                                <p>Meetings <span className='circlebg' onClick={meetingshowtogle}>{Meeting.length}</span></p>
                                                <p className="mt-4" style={{ display: 'flex', alignItems: 'center' }} onClick={handleButtonClick}>Add Meetings <i className=' ri-customer-service-2-line px-1'></i></p>
                                                {showModal && <MeetingModal onClose={() => setShowModal(false)} lead={currentLead._id} />}
                                                {meetingshow && <Meetingshowmodal onClose={meetingshowtogle} lead={currentLead._id} />}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )) : []
                    )}


                </div>
           <div className="row">
                    <div className="col-sm-12 col-md-12">
                        <div
                            className="dataTables_info"
                            id="datatable_info"
                            role="status"
                            aria-live="polite"
                        >
                            Showing {currentPage * leadsPerPage - leadsPerPage + 1} to{' '}
                            {Math.min(currentPage * leadsPerPage, totalLeads)} of {totalLeads}{' '}
                            entries
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-12">
                        <div
                            className="dataTables_paginate paging_simple_numbers"
                            id="datatable_paginate"
                        >
                            <ul className="pagination pagination-rounded">
                                <li
                                    className={`paginate_button page-item previous ${currentPage === 1 ? 'disabled' : ''
                                        }`}
                                    id="datatable_previous"
                                >
                                    <a
                                        href="#"
                                        aria-controls="datatable"
                                        aria-disabled={currentPage === 1}
                                        role="link"
                                        data-dt-idx="previous"
                                        tabIndex={0}
                                        className="page-link"
                                        onClick={prevPage}
                                    >
                                        <i className="mdi mdi-chevron-left" />
                                    </a>
                                </li>
                                {Array.from({ length: Math.ceil(totalLeads / leadsPerPage) }, (_, i) => (
                                    <li
                                        key={i}
                                        className={`paginate_button page-item ${i + 1 === currentPage ? 'active' : ''
                                            }`}
                                    >
                                        <a
                                            href="#"
                                            aria-controls="datatable"
                                            role="link"
                                            aria-current={i + 1 === currentPage ? 'page' : null}
                                            data-dt-idx={i}
                                            tabIndex={0}
                                            className="page-link"
                                            onClick={() => setCurrentPage(i + 1)}
                                        >
                                            {i + 1}
                                        </a>
                                    </li>
                                ))}
                                <li
                                    className={`paginate_button page-item next ${currentPage === Math.ceil(totalLeads / leadsPerPage) ? 'disabled' : ''
                                        }`}
                                    id="datatable_next"
                                >
                                    <button onClick={nextPage}  className="page-link"> <i className="mdi mdi-chevron-right" /></button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
            {userrole === 'Admin' && (
                <button className='float l-100 b-100 d-view' onClick={fetchDataAndDownloadExcel}>
                    <i className="ri-file-excel-2-fill my-float" />
                </button>
            )}
            <button className='float l-100 d-view' onClick={openexcelmodal}>
                <i className=" ri-upload-cloud-2-fill my-float" />
            </button>
            <Link
                href={{
                    pathname: '/Leads/Add',
                    query: { lead: 'cold' }
                }}
                className="float"
            >
                <i className="fa fa-plus my-float" />
            </Link>



        </RootLayout >


    )
}

export default Cold
