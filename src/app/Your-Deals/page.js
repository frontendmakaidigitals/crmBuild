"use client";
import React, { useEffect, useState } from 'react';
import RootLayout from '@/app/components/layout';
import SearchableSelect from '@/app/Leads/dropdown';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-modal';
import TokenDecoder from '../components/Cookies';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import styles from '../Modal.module.css';
import { formatDate } from 'date-fns';
import { FaDownload } from "react-icons/fa6";
const styless = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 20
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginBottom: 20,
    },
    text: {
        fontSize: 12,
        marginBottom: 5,
        fontWeight: 'normal', // Changed from 'bold' to 'normal'
    },
    title: {
        fontSize: 16,
        fontWeight: 'normal',
        marginBottom: 10
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20
    },
    subheader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    }
});

function Invoice() {
    const decodedToken = TokenDecoder();
    const parentStaff = decodedToken ? decodedToken.id : null;
    const role = decodedToken ? decodedToken.role : null;

    const [invoice, setInvoice] = useState([]);
        const [isModalOpen, setIsModalOpen] = useState(false);

     const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [reason, setReason] = useState('');
   useEffect(() => {
    const fetchData = async () => {
        try {
            let response;
            if (role === "Admin") {
                response = await axios.get(`/api/invoice/get`);
            } 
            else if (role === "FOS") {
                response = await axios.get(`/api/invoice/me/${parentStaff}`);
            }
            else {
                response = await axios.get(`/api/invoice/get/${parentStaff}`);
            }
            console.log(response.data.data,"respone");
            setInvoice(response.data.data);
        } catch (error) {
            console.error('Error fetching invoice:', error);
        }
    };

    if (parentStaff) {
        fetchData();
    }

}, [parentStaff, role]);

    const htmlContent = "<h1>Hello, world!</h1>";

    const handleDownloadPDF = (item) => {
        // Generate PDF content here
        const pdfContent = (
            <Document>
                <Page size="A4" style={styless.page}>
                    <View style={styless.section}>
                        <Text style={styless.text}>{'\n'}Closure Date: {item.closuredate}</Text>
                        <Text style={styless.text}>{'\n'}Expected Closure Date: {item.expecteddate}</Text>
                        <Text style={styless.text}>{'\n'}Buyer Name: {item.buyername}</Text>
                        <Text style={styless.text}>{'\n'}Sale/Rent: {item.SaleRent}</Text>
                        <Text style={styless.text}>{'\n'}Deal Status: {item.dealstatus}</Text>
                        <Text style={styless.text}>{'\n'}Mou/Contract Signed: {item.mousigned}</Text>
                        <Text style={styless.text}>{'\n'}Ready/offplan: {item.readyoffplan}</Text>
                        <Text style={styless.text}>{'\n'}Handover date: {item.handoverdate}</Text>
                        <Text style={styless.text}>{'\n'}Direct From Developer: {item.directfromdeveloper}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Name: {item.tennant?.Name}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Contact: {item.tennant?.Contact}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Email: {item.tennant?.Email}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Nationality: {item.tennant?.Nationality}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Passport: {item.tennant?.Passport}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Passport Expiry: {item.tennant?.Passportexpiry}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant DOB: {item.tennant?.dob}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Local Resident: {item.tennant?.LocalResident}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Emirated: {item.tennant?.Emirated}</Text>
                        <Text style={styless.text}>{'\n'}Buyer or Tenant Emirated Expiry: {item.tennant?.Emiratedexpiry}</Text>
                        <Text style={styless.text}>{'\n'}Direct From Seller: {item.directseller}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Name: {item.seller?.Name}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Contact: {item.seller?.Contact}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Email: {item.seller?.Email}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Nationality: {item.seller?.Nationality}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Passport: {item.seller?.Passport}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Passport Expiry: {item.seller?.Passportexpiry}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner DOB: {item.seller?.dob}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Local Resident: {item.seller?.LocalResident}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Emirated: {item.seller?.Emirated}</Text>
                        <Text style={styless.text}>{'\n'}Seller or Owner Emirated Expiry: {item.seller?.Emiratedexpiry}</Text>
                        <Text style={styless.text}>{'\n'}Property Type: {item.propertytype}</Text>
                        <Text style={styless.text}>{'\n'}Developer Name: {item.Developername}</Text>
                        <Text style={styless.text}>{'\n'}No. Of Bedrooms: {item.bedrooms}</Text>
                        <Text style={styless.text}>{'\n'}BUA in Sq.ft: {item.BUA}</Text>
                        <Text style={styless.text}>{'\n'}Plot Area in Sq.ft: {item.Plotarea}</Text>
                        <Text style={styless.text}>{'\n'}Plot No.: {item.Plot}</Text>
                        <Text style={styless.text}>{'\n'}Unit Complete Address: {item.unitadd}</Text>
                        <Text style={styless.text}>{'\n'}Price: {item.Price}</Text>
                        <Text style={styless.text}>{'\n'}Loyalty Bonus (% and Amount): {item.Loyalty}</Text>
                        <Text style={styless.text}>{'\n'}Unit Number: {item.unitNumber}</Text>
                        <Text style={styless.text}>{'\n'}Cancelled Price: {item.Cancelled}</Text>
                        <Text style={styless.text}>{'\n'}Dewa Premise: {item.Dewa}</Text>
                        <Text style={styless.text}>{'\n'}Contract Number: {item.Contract}</Text>
                        <Text style={styless.text}>{'\n'}Title Deed: {item.Title}</Text>
                        <Text style={styless.text}>{'\n'}New Title Deed: {item.NewTitle}</Text>
                        <Text style={styless.text}>{'\n'}External Agent: {item.External}</Text>


                    </View>
                </Page>
            </Document>
        );

        // Return the PDFDownloadLink component for downloading the PDF
        return (
            <PDFDownloadLink document={pdfContent} fileName="invoice.pdf">
                {({ blob, url, loading, error }) => (loading ? 'Loading document...' : <FaDownload className='text-2xl cursor-pointer'/> )}
            </PDFDownloadLink>
        );
    };

    const [date, setDate] = useState()
    

 const approved = async (invoiceid, approvedBy) => {
        try {
            if (role == "Admin") {
                await axios.put(`/api/invoice/status/${invoiceid}`, { status: 5, approvedBy });
            } else if (role == "ATL") {
                await axios.put(`/api/invoice/status/${invoiceid}`, { status: 1, approvedBy });
            } else if (role == "TL") {
                await axios.put(`/api/invoice/status/${invoiceid}`, { status: 2, approvedBy });
            } else if (role == "PNL") {
                await axios.put(`/api/invoice/status/${invoiceid}`, { status: 3, approvedBy });
            } else if (role == "BussinessHead") {
                await axios.put(`/api/invoice/status/${invoiceid}`, { status: 4, approvedBy });
            }

        } catch (error) {
            console.error('Error updating lead status:', error);
        }
    };
const openModal = (invoiceid) => {
        setSelectedInvoiceId(invoiceid);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setReason('');
    };
     const handleDisapprove = async () => {
        try {
            let status;
            if (role === "Admin") {
                status = 10;
            } else if (role === "ATL") {
                status = 6;
            } else if (role === "TL") {
                status = 7;
            } else if (role === "PNL") {
                status = 8;
            } else if (role === "BussinessHead") {
                status = 9;
            }
            await axios.put(`/api/invoice/status/${selectedInvoiceId}`, { status, reason, approvedBy: parentStaff });
            closeModal();
        } catch (error) {
            console.error('Error updating lead status:', error);
        }
    };
    console.log(invoice)

    return (
        <RootLayout>
            <div className='container-fluid p-0'>
                <div className='row'>
                    <div className='col-md-12 bg-blue d-flex justify-content-between'>
                        <div>
                            <h6 className='!mb-0'> Deals and Invoices</h6>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-md-12'>
                    <div className="table-responsive">
                        <table className="table mt-4">
                            <thead>


                                <tr className='!font-bold !text-lg !bg-slate-50 !border-b !border-slate-600 '>
                                    <th className='!text-center'>#</th>
                                    <th  className='!text-center'>Date</th>
                                     {role !== "FOS" ? (
                                    <th  className='!text-center'>Agent</th>
                                    ) :  <th  className='!text-center'>Customer Name</th>}
                                    <th  className='!text-center'>Project Name</th>
                                    <th  className='!text-center'>Value</th>
                                    <th  className='!text-center'>Status</th>
                                     <th  className='!text-center'>Reason</th>
                                   
                                        <th scope="col" className='!flex !justify-center !items-center !border-0'>Download
                                        </th>
                                    <th scope="col" className='!text-center'>Actions</th>
                                </tr>
                            </thead>
                            <tbody className='!bg-slate-50 !text-md'>
                                {invoice.map((item, index) => (
                                    <tr key={index} className='!border-b border-gray-300 !h-[70px]'>
                                        <th  >{index + 1}</th>
                                        <td className='!text-center '><p className='!mb-0 !mt-2'>{new Date(item.timestamp).toLocaleDateString()}</p></td>
                                        {role !== "FOS" ? (
                                        <td className='!flex justify-center !items-center !border-0'><p>{item.Userid.username}</p></td>
                                        ) : <td className='!text-center'>{item.buyername}</td>}
                                        <td className='!text-center'>{item.Developername} {item.Property}</td>
                                        <td className='!text-center'>{item.Price}</td>
                                        <td >
                                            <p className='!px-2 !py-2 !bg-yellow-200 !rounded-full text-center !mb-0'>Pending</p>
                                        </td>
                                    <td>
                                        {Number(item.approved) >= 6 && Number(item.approved) <= 10 && 
                                        
                                            <p>{item.cancelreason }</p>

                                    }</td>
                                    <td className='!flex !justify-center !items-center !border-0'>
                                        
                                            
                                            {handleDownloadPDF(index)}
                                        
</td>

                                        <td>
                                            <div >

                                               {role !== "FOS" && (
    <>
        {!item.submittedBy.includes(parentStaff) &&  // Check if parentStaff is not included in item.submittedBy array
            !(item.approved === "2" && role === "ATL") &&
            !(item.approved === "3" && role === "TL") &&
            !(item.approved === "4" && role === "PNL") &&
            !(item.approved === "5") &&
            !(item.approved === "10") &&
            !(item.approved === "7" && role === "ATL") &&
            !(item.approved === "8" && role === "TL") &&
            !(item.approved === "9" && role === "PNL") && (
                <div className='!flex justify-center items-cente gap-2'>
                    <div>
                        <button
                            className='btn !border !border-slate-900 !rounded-full hover:!bg-green-400 !text-slate-900'
                            onClick={() => approved(item._id, parentStaff)}
                        >
                            Approve
                        </button>
                    </div>
                    <div>
                        <button
                            className='btn hover:!bg-red-400 !border !border-slate-900 !rounded-full !text-slate-900 !px-6'
                            onClick={() => openModal(item._id)}
                        >
                            Reject
                        </button>
                    </div>
                </div>
            )}
    </>
)}

                                            </div>
                                        </td>
                                         

                                    </tr>

                                ))}
                            </tbody>
                        </table>
</div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onRequestClose={closeModal} className={styles.modalBackdrop} overlayClassName={styles.modalOverlay} contentLabel="Disapproval Reason">
    <div className={styles.modalContent}>
        <span className={styles.closeButton} onClick={closeModal}>
            &times;
        </span>
        <h4></h4>
        <div className="card-body mt-4">
            <div className="mb-4 text-left">
                <textarea className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Notes Description" />
            </div>
            <div className="mb-4">
                <button className="btn btn-primary w-100" onClick={handleDisapprove}>Submit</button>
            </div>
        </div>
    </div>
</Modal>

            <ToastContainer />
        </RootLayout >
    )
}

export default Invoice;
