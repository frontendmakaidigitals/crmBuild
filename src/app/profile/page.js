"use client";
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import Calendar from '../components/calender';
import RootLayout from '../components/layout';
import TokenDecoder from '../components/Cookies';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function ProfilePage() {
    const [sales, setsales] = useState([]);
    const [tsales, settsales] = useState([]);
    const [tLeads, settLeads] = useState([]);
    const [tfollow, settfollow] = useState([]);
    const [tmeeting, settmeeting] = useState([]);
    const [tintrested, settintrested] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState({});
    const [topdeveloper, setTopDevelopers] = useState({});
    const [percentageContribution, setPercentageContribution] = useState([]);
    const userdata = TokenDecoder();
    const userid = userdata ? userdata.id : null;
    const userrole = userdata ? userdata.role : null;



    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    // User has granted permission
                }
            });
        }
    }, []);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                let url;
                if (userrole === "Admin") {
                    url = `/api/invoice/get`;
                }
                else if (userrole === "FOS") {
                    url = `/api/invoice/FOS/${userid}`;
                }
                else if (userrole === "BussinessHead") {
                    url = `/api/invoice/parentstaff?role=ATL&userid=${userid}`;
                }
                else if (userrole === "PNL") {
                    url = `/api/invoice/parentstaff?role=PNL&userid=${userid}`;
                }
                else if (userrole === "TL") {
                    url = `/api/invoice/parentstaff?role=TL&userid=${userid}`;
                }
                else if (userrole === "ATL") {
                    url = `/api/invoice/parentstaff?role=ATL&userid=${userid}`;
                }
                console.log(url, "url")
                const response = await axios.get(url);
                const totalPrice = response.data.data.reduce((acc, invoice) => acc + parseInt(invoice.Price), 0);
                const monthlyRevenue = response.data.data.reduce((acc, invoice) => {
                    const month = new Date(invoice.timestamp).getMonth() + 1;
                    acc[month] = (acc[month] || 0) + parseInt(invoice.Price);
                    return acc;
                }, {});
                const developers = response.data.data.reduce((acc, invoice) => {
                    const developerName = invoice.Developername;
                    acc[developerName] = (acc[developerName] || 0) + 1;
                    return acc;
                }, {});
                const topDevelopers = Object.keys(developers).sort((a, b) => developers[b] - developers[a]).slice(0, 3);
                const totalTopDevelopersSales = topDevelopers.reduce((acc, dev) => acc + developers[dev], 0);
                const percentageContribution = topDevelopers.map(dev => ({
                    name: dev,
                    percentage: ((developers[dev] / totalTopDevelopersSales) * 100).toFixed(2) + '%'
                }));


                setTopDevelopers(topDevelopers);
                settsales(totalPrice)
                setMonthlyRevenue(monthlyRevenue);
                setPercentageContribution(percentageContribution);

                setsales(response.data.data.length)
            } catch (error) {
                console.error('Error fetching leads:', error);
            }
        };

        fetchLead();

    }, [userrole]);


    useEffect(() => {
        const fetchdocument = async () => {
            try {
                let url = `/api/staff/get`;
                if (userrole !== 'HR') {
                    url = `/api/staff/document/get/${userid}`;
                }
                const response = await axios.get(url);
                const staffWithoutDocument = response.data.data.filter(staff => !staff.documents);
                staffWithoutDocument.forEach(staff => {
                    toast.error(`${staff.username} does not have a document Uploaded.`);
                });
            } catch (error) {
                // Handle error
            }
        };

        fetchdocument();

    }, [userrole]);



    useEffect(() => {
        const fetchLead = async () => {
            try {
                let url;
                if (userrole === "Admin") {
                    url = `/api/Lead/get`;
                }
                else if (userrole === "FOS") {
                    url = `/api/Lead/FOS/${userid}`;
                }
                else if (userrole === "BussinessHead") {
                    url = `/api/Lead/hiearchy?role=ATL&userid=${userid}`;
                }
                else if (userrole === "PNL") {
                    url = `/api/Lead/hiearchy?role=PNL&userid=${userid}`;
                }
                else if (userrole === "TL") {
                    url = `/api/Lead/hiearchy?role=TL&userid=${userid}`;
                }
                else if (userrole === "ATL") {
                    url = `/api/Lead/hiearchy?role=ATL&userid=${userid}`;
                }
                const response = await axios.get(url);
                console.log(response);
                const followUpLeads = response.data.data.filter(lead => lead.LeadStatus === 'Follow up');
                const intretsedLeads = response.data.data.filter(lead => lead.LeadStatus === 'Intrested');
                settLeads(response.data.data.length)
                settfollow(followUpLeads.length);
                settintrested(intretsedLeads.length);

            } catch (error) {
                console.error('Error fetching leads:', error);
            }
        };

        fetchLead();

    }, [userrole]);
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <RootLayout>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                            <h4 className="mb-sm-0">Dashboard</h4>
                            <div className="page-title-right">
                                <ol className="breadcrumb m-0">
                                    <li className="breadcrumb-item">
                                        <a href="/">Miles</a>
                                    </li>
                                    <li className="breadcrumb-item active">Dashboard</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-xl-8">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Number of Deals
                                                </p>
                                                <h4 className="mb-0">{sales}</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className="fas fa-coins font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Sales Revenue
                                                </p>
                                                <h4 className="mb-0">{tsales}-commisions</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className="fas fa-money-bill font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Sales Value
                                                </p>
                                                <h4 className="mb-0">{tsales}</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className="fas fa-chart-line font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title mb-4">Revenue Analytics</h4>
                            </div>
                            <div className="card-body border-top text-center">
                                <div className="row">

                                    {Object.keys(monthlyRevenue).map(month => (
                                        <div className="col-sm-2" key={month}>
                                            <div className="">
                                                <h5 className="me-2 fs-12">{monthNames[month - 1]}</h5>
                                                <div className="text-success">{monthlyRevenue[month]} AED</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="col-xl-4">
                        <div className="card">
                            <div className="card-body">
                                <div className='d-flex justify-content-between'>
                                    <div>
                                        <h4 className="card-title mb-4">Top 3 Developers</h4>
                                    </div>
                                    {userrole === "Admin" && (

                                    <div>    <Link
                                        href={{
                                            pathname: '/Developers',

                                        }}
                                    >

                                        <button className='btn btn-primary w-30 float-end'>View All</button>
                                    </Link></div>
                                    )}
                                </div>


                                <div className="row">
                                    {Array.isArray(topdeveloper) && topdeveloper.map((developer, index) => {
                                        const developerPercentage = percentageContribution.find(dev => dev.name === developer)?.percentage || '';
                                        return (
                                            <div className="col-4" key={index}>
                                                <div className="text-center mt-4">
                                                    <p className="mb-2">
                                                        <i className="mdi mdi-circle text-primary font-size-10 me-1" />{" "}
                                                        {developer}
                                                    </p>
                                                    <h5>{developerPercentage}</h5>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
                <div className="row">
                    <div className="col-xl-8">
                        <div className="row">
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Total Number Leads
                                                </p>
                                                <h4 className="mb-0">{tLeads}</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className="fas fa-users font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Total Follow Up
                                                </p>
                                                <h4 className="mb-0">{tfollow}</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className="fab fa-teamspeak font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Total Intrested
                                                </p>
                                                <h4 className="mb-0">{tintrested}</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className=" fas fa-info font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            {/* Comment in Next.js   <div className="col-md-4">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="d-flex">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-truncate font-size-14 mb-2">
                                                    Total Meetings
                                                </p>
                                                <h4 className="mb-0">{tmeeting}</h4>
                                            </div>
                                            <div className="text-primary ms-auto">
                                                <i className=" fas fa-info font-size-24" />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            
                            */}


                        </div>

                    </div>

                </div>
                <div className="row">
                    <div className="col-xl-12">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="card p-10">
                                    <div className="text-center">
                                        <div className="row">


                                            <Calendar />


                                        </div>
                                    </div>
                                </div>



                            </div>


                        </div>

                    </div>

                </div>
            </div>

        </RootLayout >


    )
}

export default ProfilePage
