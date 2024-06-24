"use client";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import RootLayout from "../components/layout";
import PriceModal from "../components/priceModal";
import TlModal from "../components/tlModal";
import { NumericFormat } from 'react-number-format';
import "rsuite/dist/rsuite.min.css";
import SearchableSelect from "@/app/Leads/dropdown";
import moment from "moment/moment";
import * as XLSX from "xlsx";
import FileSaver from "file-saver";
import "./table.css";
import { FaRegEdit } from "react-icons/fa";
import { ImCheckmark } from "react-icons/im";
import { RiCloseFill } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { IoMdEye } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import { MdKeyboardArrowRight } from "react-icons/md";
import { TbDatabaseEdit } from "react-icons/tb";
function allDeals() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTlModalOpen, setisTlIsModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [userPerPage, setUserPerPage] = useState(10);
  const [myData, setMyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const path = "https://crm-milestonehomes.com/public/kyc/";
  const [agentFilter, setAgenFilter] = useState(null);
  const [kycFilter, setKycFilter] = useState("");
  const [date, setDate] = useState([null, null]);
  const [userIndex, setUserIndex] = useState(null)
    const [isDateInput, setIsDateInput] = useState(false);
    const toggleInputType = () => {
    setIsDateInput((prevIsDateInput) => !prevIsDateInput);
  };
   const handleKeyDown = (event) => {
    event.preventDefault();
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/invoice/get");
        console.log(response.data.data,"response")
        setMyData(response.data.data);
        setFilteredData(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const exportFile = useCallback(
    (id) => {
      if (!filteredData || typeof filteredData !== "object") {
        console.error("Invalid or missing data.");
        return;
      }
      const urlPath = "https://crm-milestonehomes.com/public/kyc/";
      const buyerOnepassFront =
        urlPath + filteredData[id]?.passfront?.split("kyc/").pop();
      const buyerOnepassBack =
        urlPath + filteredData[id]?.passback?.split("kyc/").pop();
      const buyerOneEOI =
        urlPath + filteredData[id]?.eoiimage?.split("kyc/").pop();
      const handleDownload = async () => {
        try {
          const front = await fetch(buyerOnepassFront).then((response) =>
            response.blob()
          );
          const back = await fetch(buyerOnepassFront).then((response) =>
            response.blob()
          );
          const eoi = await fetch(buyerOnepassFront).then((response) =>
            response.blob()
          );
          FileSaver.saveAs(front, "passfront.jpg");
          FileSaver.saveAs(back, "passback.jpg");
          FileSaver.saveAs(eoi, "eoi.jpg"); // Specify a file name for the downloaded image
        } catch (error) {
          console.error("Error downloading image:", error);
        }
      };

      const customHeadersMain = [
        { header: "Sr.", width: 5, color: "#000000" },
        { header: "Date on Board", width: 20 },
        { header: "Agent", width: 20 },
        { header: "Rent/Sale", width: 20 },
        { header: "Full Name", width: 20, color: "#FF0000" }, // Red color for 'Full Name'
        { header: "Nationality", width: 20 },
        { header: "Customer ID", width: 15 },
        { header: "Passport Expiry", width: 20 },
        { header: "Date of Birth", width: 15 },
        { header: "Address", width: 30 },
        { header: "Resident/Non Resident", width: 30 },
        { header: "Salary/Non Salary", width: 30 },
        { header: "Mobile No.", width: 20 },
        { header: "Email", width: 25 },
        { header: "Risk Classification", width: 30 },
        { header: "Value/ Volume of Transaction", width: 30 },
      ];

      // Combine custom headers for both main data and additional buyers
      const customHeaders = customHeadersMain.map((header) => header.header);

      // Extract buyer data from filteredData
      const buyerData = filteredData[id]; // Modify this according to your data structure

      // Flatten the buyer data into an array
      const buyerRow = [
        1,
        moment(buyerData?.timestamp).format("DD-MM-YY"),
        buyerData?.Userid?.username,
        "Sale",
        buyerData?.buyername,
        buyerData?.nationality,
        "customerId",
        buyerData?.passportexpiry,
        buyerData?.buyerdob,
        buyerData?.address,
        buyerData?.Resident,
        "salary",
        buyerData?.buyerContact,
        buyerData?.buyerEmail,
        "risk",
        "price",
      ];

      // Flatten the array data below buyerRow
      const additionalRows = (filteredData[id]?.additionalBuyers || []).map(
        (buyerOne, index) => [
          index + 2,
          moment(buyerOne?.timestamp).format("DD-MM-YY"),
          buyerOne?.Userid?.username,
          "Sale",
          buyerOne?.buyername,
          buyerOne?.nationality,
          "customerId",
          buyerOne?.passportexpiry,
          buyerOne?.buyerdob,
          buyerOne?.address,
          buyerOne?.Resident,
          "salary",
          buyerOne?.buyerContact,
          buyerOne?.buyerEmail,
          "risk",
          "price",
          // Add more properties as needed
        ]
      );

      // Create worksheet data array
      const worksheetData = [customHeaders, buyerRow, ...additionalRows];

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths
      const colWidths = [];
      customHeadersMain.forEach((header) =>
        colWidths.push({ wch: header.width })
      );
      worksheet["!cols"] = colWidths;

      // Apply styles to header row
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: range.s.r };
        const cell = worksheet[XLSX.utils.encode_cell(cellAddress)];
        const headerIndex = C - range.s.c; // Index of the header in customHeadersMain array
        const header = customHeadersMain[headerIndex];

        // Apply header style
        const headerStyle = {
          fill: { fgColor: { rgb: header.color || "FFFF00" } }, // Default to yellow color if no color specified
          font: { bold: true, color: { rgb: header.color || "000000" } }, // Default to black font color if no color specified
        };
        cell.s = { ...headerStyle };
      }

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      // Create an Excel file
      XLSX.writeFile(workbook, "exported_data.xlsx");
      handleDownload();
    },
    [filteredData]
  );
  const propertyOptions = [
        { value: 'Apartment', label: 'Apartment' },
        { value: 'Town House', label: 'Town House' },
        { value: 'Villa', label: 'Villa' }

    ]


  const agentNames = [
    { value: "Super admin", label: "Super admin" },
    { value: "Admin", label: "Admin" },
    { value: "SalesHead", label: "Sales Head" },
    { value: "Manager", label: "Manager" },
    { value: "BussinessHead", label: "Bussiness Head" },
    { value: "PNL", label: "PNL" },
    { value: "TL", label: "TL" },
    { value: "ATL", label: "ATL" },
    { value: "FOS", label: "FOS" },
  ];
     const readyStatus = [
        { value: 'Ready', label: 'Ready' },
        { value: 'Off-Plan', label: 'Off-Plan' },

    ]
  useEffect(() => {
    let filteredResult = myData;

    if (agentFilter) {
      filteredResult = filteredResult.filter(
        (agent) => agent.Userid.username === agentFilter
      );
    }

    if (kycFilter) {
      filteredResult = filteredResult.filter(
        (agent) => agent.kycStatus === kycFilter
      );
    }
    const filteredResultWithEdit = filteredResult.map((item) => ({
      ...item,
      edit: null,
      PlotArea:parseFloat(item.PlotArea.replace(/\B(?=(\d{3})+(?!\d))/g, ','))
      
    }));
    
    

    setFilteredData(filteredResultWithEdit);
  }, [agentFilter, kycFilter, myData]);
    console.log(myData)
  const toggleModal = (index) => {
     
    setIsModalOpen(!isModalOpen);
    setUserIndex(index)
     
  };
  const toggleTlModal = (index) => {
     
    setIsModalOpen(!isTlModalOpen);
    setUserIndex(index)
     
  };
  const [users, setUsers] = useState([]);

  const toggleDocumentModal = (e, userId) => {
    setIsDocumentModalOpen(!isDocumentModalOpen);
    setSelectedUserId(userId);
  };

  const downloadFile = async (fileUrl) => {
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob", // important for downloading files
      });
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        fileUrl.substring(fileUrl.lastIndexOf("/") + 1)
      );
      document.body.appendChild(link);
      link.click(); // This should trigger the download
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };
 const commissionCurrency = [
        { value: '%', label: '%' },
        { value: 'AED', label: 'AED' },

    ]
  const [showEOI, setShowEOI] = useState(null);
  const [showSPA, setShowSPA] = useState(null);
  const [showBooking, setShowBooking] = useState(null);

  const submit = async(data, id) => {
      console.log(data)
        try {
                const response = await axios.put(`/api/invoice/table/${id} `, { data:data });     
                

            } catch (error) {
                console.log(error);
            }
  };
    
    console.log(filteredData)
  
   const [eoiIndex, seteoiIndex] = useState(null)
    const [bookingIndex, setbookingIndex] = useState(null)
    const [eoiSPA, setSPAIndex] = useState(null)
    const showImageEOI = (index) => {
        setShowEOI(true);
        seteoiIndex(index)  
       
    }

    const showImageBooking = (index) => {
        setShowBooking(true);
        seteoiIndex(index)  
       
    }

    const showImageSPA = (index) => {
        setShowSPA(true);
        seteoiIndex(index)  
       
    }
  
    const [collapsed, setCollapsed] = useState(false)
   const handleDownload = async (apiUrl) => {
    
    const fileName = apiUrl.split('/').pop();
    const aTag = document.createElement('a');
    aTag.href = apiUrl;
    aTag.setAttribute('download', fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
  };

  // Handler for the button click
  
  const developerOptions = [
    { value: 'Emaar Properties', label: 'Emaar Properties' },
    { value: 'DAMAC Properties', label: 'DAMAC Properties' },
    { value: 'Nakheel Properties', label: 'Nakheel Properties' },
    { value: 'Meraas', label: 'Meraas' },
    { value: 'MAG Property Development', label: 'MAG Property Development' },
    { value: 'Sobha Realty', label: 'Sobha Realty' },
    { value: 'Danube Properties', label: 'Danube Properties' },
    { value: 'Azizi Developments', label: 'Azizi Developments' },
    { value: 'Al Futtaim Group Real Estate', label: 'Al Futtaim Group Real Estate' },
    { value: 'other', label: 'Other' },
]
     const [collapsed2, setCollapsed2] = useState(false);
     const [agentCompute, setAgentCompute] = useState([])

  return (
    <RootLayout>
      {isModalOpen && (
        <PriceModal
          userData={filteredData[userIndex]}
          onClose2={toggleModal}
        />
      )
          
      }
      {isTlModalOpen && (
        <PriceModal
          userData={filteredData[userIndex]}
          onClose2={toggleModal}
        />
      )
          
      }
      
      <div className="flex  items-center gap-3 relative z-[9]">
        <div>
          <SearchableSelect
            options={agentNames}
            onChange={(value) => setAgenFilter(value.label)}
            placeholder={"Agent Name"}
            className={`relative z-[9]`}
          ></SearchableSelect>
        </div>

        <div>
          <SearchableSelect
            options={[]}
            onChange={(value) => setKycFilter(value.label)}
            placeholder={"Select Team"}
            className={`relative z-[9]`}
          ></SearchableSelect>
        </div>
      </div>
      <div className=" !overflow-x-scroll mt-2">
        {showEOI  && (
            <div className="!flex !flex-col  !w-[50%] !rounded-md !h-[80%] fixed items-end top-20 left-[30%] z-[9999]">
              <IoMdClose
                className="!text-[2.3rem] cursor-pointer hover:bg-red-500 rounded-full p-1 bg-gray-300  !text-gray-900"
                onClick={() => setShowEOI(null)}
              />
              <embed
                src={path + filteredData[eoiIndex].eoiimage?.split("kyc/").pop()}
                type="application/pdf"
                className="w-full h-full"
              />
            </div>
              )}
              
              {showSPA  && (
                        <div className="!flex !flex-col  !w-[50%] !rounded-md !h-[80%] fixed items-end top-20 left-[30%] z-[9999]">
                          <IoMdClose
                            className="!text-[2.3rem] cursor-pointer hover:bg-red-500 rounded-full p-1 bg-gray-300  !text-gray-900"
                            onClick={() => setShowSPA(null)}
                          />
                          <embed
                            src={path + filteredData[eoiIndex].SPAmage?.split("kyc/").pop()}
                            type="application/pdf"
                            className="w-full h-full"
                          />
                        </div>
              )}
              

              {showBooking &&  (
                        <div className="!flex !flex-col  !w-[50%] !rounded-md !h-[80%] fixed items-end top-20 left-[30%] z-[9999]">
                          <IoMdClose
                            className="!text-[2.3rem] cursor-pointer hover:bg-red-500 rounded-full p-1 bg-gray-300  !text-gray-900"
                            onClick={() => setShowBooking(null)}
                          />
                          <embed
                            src={path + filteredData[eoiIndex]?.bookingmage?.split("kyc/").pop()}
                            type="application/pdf"
                            className="w-full h-full"
                          />
                        </div>
              )}
        <div className={` ${collapsed || collapsed2 ? '!w-[13800px]' : collapsed && collapsed2 && '!w-[16000px]'} w-[9000px]`}>
          <div className="table-container ">
            <table className="table   scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar scrollbar-thumb-slate-700 scrollbar-track-slate-300">
              <thead className="w-full text-gray-700 relative">
                <tr className="text-md !border-b border-slate-600 ">
                  <th className={` !bg-[#D2E8F2]  fixed-column !left-0 `}>#</th>
                  <th className={` !bg-[#D2E8F2]  fixed-column  !left-[34px]`}>
                    Agent Name
                  </th>
                  <th className={` !bg-[#D2E8F2]  fixed-column !left-[143px]`}>
                    Agent Phone Number
                  </th>
                  <th className={` !bg-[#D2E8F2]  fixed-column !left-[315px]`}>
                    Date of Lead Created
                  </th>
                  <th className={` !bg-[#D2E8F2]  fixed-column !left-[484px]`}>
                    Lead Source
                  </th>
                  <th onClick={()=>setCollapsed2(!collapsed2)} id='One' className="cursor-pointer hover:!bg-blue-200  !px-1 !bg-[#D2E8F2]">
                    <div className={`flex justify-start items-center gap-3`}>
                        Buyer Full Name
                        <MdKeyboardArrowRight className={`${collapsed2 ? 'rotate-180' : 'rotate-0'}`} />
                    </div>  
                  </th>
 
                   
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">Phone Number</th>: null
                  }
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">Email Id</th>: null
                  }
                  {
                    collapsed2 ?   <th className="  !px-1 !bg-[#9ED8F2]">Date of Birth</th>: null
                  }
                  {
                    collapsed2 ?    <th className=" !px-1  !bg-[#9ED8F2]">Passport Number</th>: null
                  }
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">Passport Expiry</th>: null
                  }
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">Nationality</th>: null
                  }
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">UAE Resident</th>: null
                  }
                  {
                    collapsed2 ? <th className="  !px-1 !bg-[#9ED8F2]">Emirates ID</th>: null
                  }
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">Emirates Expiry</th>: null
                  }
                  {
                    collapsed2 ?  <th className="  !px-1 !bg-[#9ED8F2]">Address</th>: null
                  }
                  
                  
                  <th className="!px-1 !bg-[#ffbb7c] hover:!bg-[#cc9663] cursor-pointer flex justify-start items-center gap-3" onClick={()=>setCollapsed(!collapsed)}>Seller Full Name <MdKeyboardArrowRight className={`${collapsed ? 'rotate-180' : 'rotate-0'}`} /></th>
                  
                   {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Buyer Full Name</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Phone Number</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Email Id</th>: null
                  }
                  {
                    collapsed ?   <th className="  !px-1 !bg-[#ffbb7c]">Date of Birth</th>: null
                  }
                  {
                    collapsed ?    <th className=" !px-1  !bg-[#ffbb7c]">Passport Number</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Passport Expiry</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Nationality</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">UAE Resident</th>: null
                  }
                  {
                    collapsed ? <th className="  !px-1 !bg-[#ffbb7c]">Emirates ID</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Emirates Expiry</th>: null
                  }
                  {
                    collapsed ?  <th className="  !px-1 !bg-[#ffbb7c]">Address</th>: null
                  }
                  
                  <th className="  !px-1 !bg-[#D2E8F2]">EOI / Token Date</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Date of Closure</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Date of Booking</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Expected Handover Date</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Property Type</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Developer</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">No. of Bed</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Size /BUA Sq/Ft</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Plot Area in Sq.FT</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Plot Number</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Ready/Offplan</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Unit Address</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Unit Price</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Comission</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Spot Cash</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Gross Total Comission</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">VAT</th>
                  <th className="  !px-1 !bg-[#D2E8F2]">
                    
                    Total Commission Including VAT
                  </th>
                  <th className="  !px-1 !bg-[#D2E8F2]">
                    
                    Loyalty Bonus if Any
                  </th>
                  <th className="  !px-1 !bg-[#D2E8F2]">Net/Total Comission</th>
                  <th className="  !px-1 !bg-[#D2E8F2]  ">
                    <div className='flex items-center justify-around gap-3'>
                    <p className="!m-0 !border-0">EOI Receipt</p>
                    <p className="!m-0 !border-0">Booking Form</p>
                    <p className="!m-0 !border-0">SPA Copy</p></div>
                  </th>
                  <th className="   !bg-[#D2E8F2]">Invoice Number</th>
                  <th className="   !bg-[#D2E8F2]">
                    Grand Total Commission + External Payouts
                  </th>
                  <th className="  !px-1 !bg-[#D2E8F2]">VAT 5%</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">
                    Inc VAT, Gross Total Comission + External Payouts
                  </th>
                  <th className=" !px-1  !bg-[#D2E8F2]">Loyalty Bonus</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">
                    Total Comission (AED) to MSHRE Gross
                  </th>
                  <th className=" !px-1  !bg-[#D2E8F2]">Agent Commission %</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">Agent (AED) Commission</th>
                  <th className="!px-1   !bg-[#D2E8F2]">TL Comission %</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">TL (AED) Comission</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">SM Comission %</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">SM (AED) Comission</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">
                    External Agent Comission %
                  </th>
                  <th className="  !px-1 !bg-[#D2E8F2]">
                    External Agent (AED) Comission
                  </th>
                  <th className="  !px-1 !bg-[#D2E8F2]">External TL Comission %</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">
                    External TL (AED) Comission
                  </th>
                  <th className=" !px-1  !bg-[#D2E8F2]">External SM Comission %</th>
                  <th className=" !px-1  !bg-[#D2E8F2]">
                    External SM (AED) Comission
                  </th>
                  <th
                    className=" !px-1 sticky right-0  !bg-red-500
                  "
                  >
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="relative overflow-y-scroll">
                {filteredData.map((row, index) => (
                  <tr key={index} className="border-b border-slate-400">
                    <td className={` !bg-[#F1F5F7]  fixed-column !left-0`}>
                      {index + 1}
                    </td>
                    <td className={` !bg-[#F1F5F7]  fixed-column  !left-[34px]`}>
                      {row?.Userid?.username}
                    </td>
                    <td className={` !bg-[#F1F5F7]  fixed-column !left-[143px]`}>
                      {row?.Userid?.Phone}
                    </td>
                    <td className={` !bg-[#F1F5F7]  fixed-column !left-[315px]`}>
                      {row.LeadCreatedDate}
                    </td>

                    <td className={` !bg-[#F1F5F7]  fixed-column !left-[484px]`}>
                      {row.AgentPhoneNumber}
                    </td>

                    <td scope="row" className="relative !px-1 z-[0]  ">
                      <input
                        value={row?.buyername}
                        disabled={row.edit === null || row.edit === false}
                        className={`px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]`}
                        
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].buyername = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                  value={addBuyers?.buyername}
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].buyername = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                />
                              </div>
                            );
                          })
                        : null}
                    </td>

                    {
                        collapsed2 ? <td scope="row" className="relative z-[1] !px-1  ">
                      <input
                        value={row?.buyerContact}
                        disabled={row.edit === null || row.edit === false}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].buyerContact = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.buyerContact}
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].buyerContact = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7] "
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> :null
                    }

                   {
                       collapsed2 ?  <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.buyerEmail}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        disabled={row.edit === null || row.edit === false}
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].buyerEmail = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.buyerEmail}
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].buyerEmail = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null
                   }

                   {collapsed2 ?  <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.buyerdob}
                         onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        disabled={row.edit === null || row.edit === false}
                         max={new Date().toISOString().split("T")[0]}
                         type="date"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].buyerdob = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                 onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                                  value={addBuyers?.buyerdob}
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                  max={new Date().toISOString().split("T")[0]}
                         type="date"
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].buyerdob = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> :null }

                    {
                        collapsed2 ? <td scope="row" className="relative z-[1] !px-1">
                      <input
                        value={row?.buyerpassport}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].buyerpassport = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.buyerpassport}
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].buyerpassport = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null
                    }

                    {collapsed2 ? <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.passportexpiry}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                         onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].passportexpiry =
                            e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}
                        min={new Date().toISOString().split("T")[0]}
                        type="date"
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                 min={new Date().toISOString().split("T")[0]}
                                  type="date"
                                  value={addBuyers?.passportexpiry}
                                   onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].passportexpiry = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                  
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> :null}

                    {collapsed2 ? <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.nationality}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].nationality = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.nationality}
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].nationality = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null}

                    {
                        collapsed2 ? <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Resident}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        disabled
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.Resident}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null
                    }

                   {
                       collapsed2 ?  <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.emiratesid}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        disabled
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.emiratesid}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null
                   }

                   {
                       collapsed2 ?  <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.emiratesExpiry !== '' ? row?.emiratesExpiry : 'N/A'}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        disabled
                         onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                        min={new Date().toISOString().split("T")[0]}
                        type="date"
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.emiratesExpiry}
                                  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled
                                  min={new Date().toISOString().split("T")[0]}
                                  type="date"
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null
                   }

                  {
                      collapsed2 ?   <td scope="row" className="relative z-[1] !px-1">
                      <input
                        value={row?.address}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].address = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}
                      />
                      {row.additionalBuyers.length > 0
                        ? row.additionalBuyers.map((addBuyers, id) => {
                            return (
                              <div key={id} className={`mt-1`}>
                                <input
                                  value={addBuyers?.address}
                                  onChange={(e) => {
                                    const newFilteredData = [...filteredData];
                                    newFilteredData[index].additionalBuyers[
                                      id
                                    ].address = e.target.value;
                                    setFilteredData(newFilteredData);
                                  }}
                                  className="px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                  disabled={
                                    row.edit === null || row.edit === false
                                  }
                                />
                              </div>
                            );
                          })
                        : null}
                    </td> : null
                  }

                    <td scope="row" className="relative  z-[1] !px-1 ">
                    </td>
                    
                 
                 
                    {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                    {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                    {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                    {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                    {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                    {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                   }
                   {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                   }
                   {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                   }
                   {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                   }

                  {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                  {
                      collapsed ?  <td scope="row" className="relative  z-[1] !px-1 ">
                      
                      </td> :null
                    }
                    
                    

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.EOI}
                         onKeyDown={handleKeyDown}
                         onFocus={toggleInputType}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].EOI = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='date'
                        disabled={row.edit === null || row.edit === false}
                        
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Closure}
                         onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Closure = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='date'
                        disabled={row.edit === null || row.edit === false}
                        
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Booking}
                         onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Booking = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='date'
                        
                        disabled={row.edit === null || row.edit === false}
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Handover}
                         onKeyDown={handleKeyDown}
                                  onFocus={toggleInputType}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Handover = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='date'
                        
                        disabled={row.edit === null || row.edit === false}
                      />
                    </td>

                    <td scope="row" className="relative !px-1 ">
                          <SearchableSelect
                                            options={propertyOptions}
                                            onChange={(e) => {
                                                const newFilteredData = [...filteredData];
                                                newFilteredData[index].Property = e.value;
                                                setFilteredData(newFilteredData);
                                                }}
                                                disabled={row.edit === null || row.edit === false}
                                                defaultValue={row.Property
}
                                                />
                        
 
                    </td>

                        <td scope="row" className="relative  !px-1 ">
                        <div className={row?.Developer === 'other' ? 'grid grid-cols-2 gap-x-4' : 'grid grid-cols-1 gap-x-4'}>
                                <SearchableSelect
                                    className={'z-[0]'}
                                    options={developerOptions}
                                    disabled={row.edit === null || row.edit === false}
                                    defaultValue={row.Developer}
                                                        onChange={(e) => {
                                                            const newFilteredData = [...filteredData];
                                                            newFilteredData[index].Developer = e.value;
                                                            setFilteredData(newFilteredData);
                                                          }}
                                                    />
                                                    {row.Developer === 'other' && (
                                                        <input
                                                           className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                                                            value={row.othrDeveloper}
                                                            onChange={(e) => {
                                                                const newFilteredData = [...filteredData];
                                                                newFilteredData[index].othrDeveloper = e.value;
                                                                setFilteredData(newFilteredData);
                                                              }}
                                                            placeholder="Enter developer name"
                                                            disabled={row.edit === null || row.edit === false}
                                                        />
                                                    )}
                                                </div>
                     
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Bed}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Bed = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='number'
                        disabled={row.edit === null || row.edit === false}
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.BUA}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].BUA = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='number'
                        disabled={row.edit === null || row.edit === false}
                      />
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={(row?.PlotArea)}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].PlotArea = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        type='number'
                        disabled={row.edit === null || row.edit === false}
                      />
                    </td>

              

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Property == 'Apartment' ? 'N/A' : row?.PlotNumber}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].PlotNumber = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        
                        disabled={row.edit === null || row.edit === false || row.Property == 'Apartment'}
                      />
                    </td>
             

                    <td scope="row" className="relative !px-1 ">
                      <SearchableSelect
                      className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                      disabled={row.edit === null || row.edit === false}
                                                    options={readyStatus}
                                                    defaultValue={row?.Ready}
                                                      onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Ready = e.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}
                                                    placeholder="Ready / Offplan"
                                                />
                    
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.Unitaddress}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Unitaddress = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                     <div className={`flex justify-start items-center gap-3`}>
                      <input
                       value={row?.Price
                              ? parseFloat(row?.Price.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : ''
                            } 
 
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Price = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled 
                      />
                      
                     
                       <button
                          className={`${row?.edit ? 'text-slate-900' : 'text-slate-500'}`}
                           disabled={row.edit === null || row.edit === false}
                          onClick={()=>{toggleModal(index)}}
                        >
                          <TbDatabaseEdit />
                        </button>
                     </div>
                    </td>

                    <td scope="row" className="relative  !px-1 ">
                    <div className={`flex justify-center items-center`}>
                      <input
                        value={row?.Comission+row?.ComissionType}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].Comission = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled 
                      />
                    </div>
                                                    
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        value={row?.SpotCash ? parseFloat(row?.SpotCash.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '00'}
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].SpotCash = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled 
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        
                        value={row?.TotalComission
                              ? parseFloat(row?.TotalComission.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : ''
                            } 
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].TotalComission=e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled 
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                        
                         value={row?.VAT
                              ? parseFloat(row?.VAT.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : ''
                            }
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].VAT =
                            e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                        disabled 
                      />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1  ">
                      <input
                        value={row?.ComissionVAT
                              ? parseFloat(row?.ComissionVAT.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : ''
                            }

                        
                        disabled 
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].ComissionVAT = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                         
                      />
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                      value={row?.loyaltyBonus
                              ? parseFloat(row?.loyaltyBonus.replace(/,/g, '')).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              : '00'
                            }
                
                        
                        disabled 
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].loyaltyBonus = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                         
                      />
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <input
                         value={row?.loyaltyBonus ? parseFloat(parseFloat(row?.TotalComission) - parseFloat(row?.loyaltyBonus)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : parseFloat(row?.TotalComission).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        disabled 
                        className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"
                        onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].netcom = e.target.value;
                          setFilteredData(newFilteredData);
                        }}
                         
                      />
                    </td>
                    
                        
                    <td
                      scope="row"
                      className="relative flex items-center !border-0 gap-3 !px-1 w-full justify-around text-md z-[1] mt-3"
                    >
                      <div className="flex w-full justify-around">
                        <p className="!m-0 !border-0">
                          <FaCheck className={`cursor-pointer ${row.eoiimage.length < 5 ? 'text-slate-300' : 'text-green-300'}`}  />{" "}
                        </p>
                        <p className="!m-0 !border-0">
                          <IoMdEye
                            className="cursor-pointer"
                             onClick={() => {
                               showImageEOI(index)
                            }}
                          />{" "}
                        </p>
                                <p className="!m-0 !border-0" onClick={ ()=>{ handleDownload(path+row.eoiimage.split('kyc/').pop(), 'file.pdf')}} >
                          <IoMdDownload
 
                            className="cursor-pointer"
                          />{" "}
                        </p>
                      </div>
                      <div className="flex w-full justify-around">
                        <p className="!m-0 !border-0">
                          <FaCheck className={`cursor-pointer ${row.bookingmage.length < 5 ? 'text-slate-300' : 'text-green-300'}`}  />
                        </p>
                        <p className="!m-0 !border-0" >
                          <IoMdEye
                            className="cursor-pointer"
                             onClick={() => {
                                showImageBooking(index)
                            }}
                          />{" "}
                        </p>
                        <p className="!m-0 !border-0" onClick={ ()=>{ handleDownload(path+row.bookingmage.split('kyc/').pop(), 'file.pdf')}}>
                          <IoMdDownload className="cursor-pointer" />{" "}
                        </p>
                      </div>
                      <div className="flex w-full justify-around">
                        <p className="!m-0 !border-0">
                          <FaCheck className={`cursor-pointer ${row.SPAmage.length < 5 ? 'text-slate-300' : 'text-green-300'}`}  />
                        </p>
                        <p className="!m-0 !border-0">
                          <IoMdEye
                            className="cursor-pointer"
                            onClick={() => {
                              showImageSPA(index);
                            }}
                          />{" "}
                        </p>
                        <p className="!m-0 !border-0" onClick={ ()=>{ handleDownload(path+row.SPAmage.split('kyc/').pop(), 'file.pdf')}}>
                          <IoMdDownload className="cursor-pointer" />{" "}
                        </p>
                      </div>

                      
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                       <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" disabled />
                    </td>

                     <td scope="row" className="relative z-[1]  !px-1">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" disabled value={row?.loyaltyBonus ? parseFloat(parseFloat(row?.TotalComission) - parseFloat(row?.loyaltyBonus)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : parseFloat(row?.TotalComission).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </td>

                    <td scope="row" className="relative z-[1] !px-1" >
                    <NumericFormat  className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" disabled value={row?.loyaltyBonus ? parseFloat((parseFloat(row?.TotalComission) - parseFloat(row?.loyaltyBonus))*5 / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : (parseFloat(row?.TotalComission)*5/100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') } /> 
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                     <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"  disabled value={row?.loyaltyBonus ? parseFloat(parseFloat(row?.TotalComission) - parseFloat(row?.loyaltyBonus) + (parseFloat(row?.TotalComission) - parseFloat(row?.loyaltyBonus))*5 / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : parseFloat(row?.TotalComission).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                    </td>

                     

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"  disabled/>
                    </td>

                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" thousandSeparator=","   disabled={row.edit === null || row.edit === false} value={row?.mshreComission} thousandSeparator="," onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].mshreComission = Number(e.target.value);
                          setFilteredData(newFilteredData);
                        }}
                        />
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                     <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"   value={row?.agentComissionPercent}  onChange={(e) => {
                          const newFilteredData = [...filteredData];
                           newFilteredData[index] = {
      ...newFilteredData[index], // Maintain other properties of the row
      agentComissionPercent: Number(e.target.value),
      agentComissionAED: row?.loyaltyBonus
        ? (parseFloat(row?.TotalComission) - parseFloat(row?.loyaltyBonus)) * Number(e.target.value) / 100
        : parseFloat(row?.TotalComission) * Number(e.target.value) / 100
    };
    setFilteredData(newFilteredData);
    
    
                          
                        }}  disabled={row.edit === null || row.edit === false} />
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.agentComissionAED?.toFixed(2)} thousandSeparator=","   
                        disabled/>
                    </td >
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.tlComissionPercent}    onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].tlComissionPercent = Number(e.target.value);
                          newFilteredData[index].tlComissionAED = row?.loyaltyBonus ? parseFloat((parseFloat(row?.TotalComission)  - parseFloat(row?.loyaltyBonus)) * row?.tlComissionPercent / 100) : parseFloat(row?.TotalComission)* row?.tlComissionPercent /100;
                          setFilteredData(newFilteredData);
                          
                        }}
                        disabled={row.edit === null || row.edit === false}/>
                    </td >
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.tlComissionAED?.toFixed(2)} thousandSeparator="," disabled/>
                    </td >
                    <td scope="row" className="relative z-[1] !px-1 ">
                    <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.smComissionPercent} max="100" onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].smComissionPercent = Number(e.target.value);
                           newFilteredData[index].smComissionAED = row?.loyaltyBonus ? parseFloat((parseFloat(row?.TotalComission)  - parseFloat(row?.loyaltyBonus)) * row?.smComissionPercent / 100) : parseFloat(row?.TotalComission)* row?.smComissionPercent /100;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}/>
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" thousandSeparator="," value={row?.smComissionAED?.toFixed(2)} disabled />
                    </td>
                    
                    <td scope="row" className="relative z-[1] !px-1 ">
                      <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.exAgentsComissionPercent} max="100" onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].exAgentsComissionPercent = Number(e.target.value);
                          newFilteredData[index].exAgentsComissionAED = row?.loyaltyBonus ? parseFloat((parseFloat(row?.TotalComission)  - parseFloat(row?.loyaltyBonus)) * row?.exAgentsComissionPercent / 100) : parseFloat(row?.TotalComission)* row?.exAgentsComissionPercent /100;
                          setFilteredData(newFilteredData);
                        }} disabled={row.edit === null || row.edit === false}/>
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                       <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.exAgentsComissionAED?.toFixed(2)} thousandSeparator=","   
                        disabled/>
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                       <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.exTLComissionPercent} max="100" onChange={(e) => {
                          const newFilteredData = [...filteredData];
                         
                          newFilteredData[index].exTLComissionPercent = Number(e.target.value);
                            newFilteredData[index].exTLComissionAED = row?.loyaltyBonus ? parseFloat((parseFloat(row?.TotalComission)  - parseFloat(row?.loyaltyBonus)) * row?.exTLComissionPercent / 100) : parseFloat(row?.TotalComission)* row?.exTLComissionPercent /100;
                          setFilteredData(newFilteredData);
                        }}
                        disabled={row.edit === null || row.edit === false}/>
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                       <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]"  thousandSeparator="," value={row?.exTLComissionAED?.toFixed(2)}   disabled/>
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                        <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" value={row?.exSMComissionPercent} max="100" onChange={(e) => {
                          const newFilteredData = [...filteredData];
                          newFilteredData[index].exSMComissionPercent = Number(e.target.value);
                          newFilteredData[index].exSMComissionAED = row?.loyaltyBonus ? parseFloat((parseFloat(row?.TotalComission)  - parseFloat(row?.loyaltyBonus)) * row?.exSMComissionPercent / 100) : parseFloat(row?.TotalComission)* row?.exSMComissionPercent /100;
                          setFilteredData(newFilteredData);
                        }} disabled={row.edit === null || row.edit === false} />
                    </td>
                    <td scope="row" className="relative z-[1] !px-1 ">
                        <NumericFormat className=" px-1 py-1 disabled:!border-0 disabled:!bg-[#F1F5F7]" thousandSeparator="," value={row?.exSMComissionAED?.toFixed(2)} disabled />
                    </td>
                    
                       
                  

                    <td
                      row={"row"}
                      className="sticky right-0 z-[9] !bg-[#F1F5F7]"
                    >
                       
                        <button
                          className="text-lg cursor-pointer inline-block !mr-2"
                          onClick={() => {
                            const newFilteredData = [...filteredData];
                            newFilteredData[index].edit = true;
                            setFilteredData(newFilteredData);
                          }}
                        >
                          <FaRegEdit />
                        </button>
                       
                      <button
                        className={`text-lg !inline-block   ${
                          row.edit == null || row.edit == false || row.buyername.length <1 || row.buyerContact.length <1 || row.buyerEmail.length <1 || row.buyerdob.length <1 || row.buyerpassport.length <1  || row.passportexpiry.length <1  || row.nationality.length <1  || row.address.length <1  || row.Closure.length <1  || row.Booking.length <1 
                            ? "text-slate-300"
                            : "text-green-300"
                        } `}
                        onClick={() => {
                          submit(row, row._id);
                            const newFilteredData = [...filteredData];
                            newFilteredData[index].edit = false;
                            setFilteredData(newFilteredData);

                        }}
                        disabled={row.edit === null || row.edit === false || row.buyername.length <1 || row.buyerContact.length <1 || row.buyerEmail.length <1 || row.buyerdob.length <1 || row.buyerpassport.length <1  || row.passportexpiry.length <1  || row.nationality.length <1  || row.address.length <1  || row.Closure.length <1  || row.Booking.length <1  }
                      >
                        <ImCheckmark />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RootLayout>
  );
}

export default allDeals;
