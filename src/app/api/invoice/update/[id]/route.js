import connect from "@/dbConfig/dbConfig";
import { NextResponse } from "next/server";
import Invoice from "@/models/invoice";
import jwt from 'jsonwebtoken';
import fs from "fs";
import path from "path";
connect();

export async function PUT(request, { params }) {
    try {
        const id = params.id;
        console.log(id, "id");

        const token = request.cookies.get('token')?.value || '';
        const decoded = jwt.decode(token);
        const userId = decoded.id;
        const username = decoded.name;
        const reqBody = await request.json();
        const uploadsDir = path.join(process.cwd(), 'public', 'kyc');

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }


        const buyerOneKycImagesFileNames = [];
        const buyerkYCNames = [];
        const nonBase64Urls = [];
        const nonBase64Urls2 = [];
        const buyerOneKycImagesArray = reqBody.buyerImages1Base64?.buyerOneKycImages || [];
       const buyerOneKycImagesnewArrayWithNonBase64= buyerOneKycImagesArray.map((item, index) => {
            if (item && typeof item === 'string' && !item.startsWith('data:application/pdf;base64,')) {
                buyerOneKycImagesFileNames.push(item);
            }
            else {
                const base64Data = item.replace(/^data:application\/pdf;base64,/, '');
                const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
                const buyerImagePath = path.join(uploadsDir, `fixed_kyc_${uniqueNumber}_buyerImages${index + 1}.pdf`);
                try {
                    fs.writeFileSync(buyerImagePath, base64Data, 'base64');
                    buyerOneKycImagesFileNames.push(buyerImagePath);
                } catch (error) {
                    console.error(`Error saving file ${buyerImagePath}: ${error.message}`);
                    throw error;
                }
            }
        });

        const buyerKycArray = reqBody.buyerImages1Base64?.additionalBuyerKycImages || [];
        const buyerKycArrayWithNonBase64= buyerKycArray.map((item, index) => {
            if (item && typeof item === 'string' && !item.startsWith('data:application/pdf;base64,')) {
                buyerkYCNames.push(item);
            }
            else {
                const base64Data = item.replace(/^data:application\/pdf;base64,/, '');
                const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
                const buyerImagesPath = path.join(uploadsDir, `multiple_kyc_${uniqueNumber}_buyer${index + 1}.pdf`);
                try {
                    fs.writeFileSync(buyerImagesPath, base64Data, 'base64');
                    buyerkYCNames.push(buyerImagesPath);
                } catch (error) {
                    console.error(`Error saving file ${buyerImagesPath}: ${error.message}`);
                    throw error;
                }
            }
        });

        const buyerRegImagesArray = reqBody.buyerImages1Base64?.buyerRegImages || [];
        const newArrayWithNonBase64 = buyerRegImagesArray.map((item, index) => {
            if (item && typeof item === 'string' && !item.startsWith('data:application/pdf;base64,')) {
                nonBase64Urls.push(item);
            }
            else {
                const base64Data = item.replace(/^data:application\/pdf;base64,/, '');
                const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
                const buyerRegImagePath = path.join(uploadsDir, `reg_kyc_${uniqueNumber}_buyer${index + 1}.pdf`);
                try {
                    fs.writeFileSync(buyerRegImagePath, base64Data, 'base64');
                    nonBase64Urls.push(buyerRegImagePath);
                } catch (error) {
                    console.error(`Error saving file ${buyerRegImagePath}: ${error.message}`);
                    throw error;
                }
            }
        });



        const additionalbuyerRegImagesArray = reqBody.buyerImages1Base64?.additionalbuyerRegImages || [];
        const newArrayWithNonBase642 = additionalbuyerRegImagesArray.map((item, index) => {
            if (item && typeof item === 'string' && !item.startsWith('data:application/pdf;base64,')) {
                nonBase64Urls2.push(item);
            }
            else {
                const base64Data = item.replace(/^data:application\/pdf;base64,/, '');
                const uniqueNumber = Math.floor(1000 + Math.random() * 9000);
                const additionalbuyerRegImagePath = path.join(uploadsDir, `add_reg_kyc_${uniqueNumber}_buyer${index + 1}.pdf`);
                try {
                    fs.writeFileSync(additionalbuyerRegImagePath, base64Data, 'base64');
                    nonBase64Urls2.push(additionalbuyerRegImagePath);
                } catch (error) {
                    console.error(`Error saving file ${additionalbuyerRegImagePath}: ${error.message}`);
                    throw error;
                }
            }
        });



        const tempAddedBuyerData = reqBody.data.additionalBuyers || [];
        let additionalBuyers = [];
        if (tempAddedBuyerData.length > 0) {
            additionalBuyers = tempAddedBuyerData.map(buyer => ({
                buyername: buyer?.buyername || "",
                buyerEmail: buyer?.buyerEmail || "",
                buyerContact: buyer?.buyerContact || "",
                buyerdob: buyer?.buyerdob || "",
                buyerpassport: buyer?.buyerpassport || "",
                passportexpiry: buyer?.passportexpiry || "",
                nationality: buyer?.nationality || "",
                Resident: buyer?.Resident || "",
                emiratesExpiry: buyer?.emiratesExpiry || "",
                address: buyer?.address || "",
                emiratesid: buyer?.emirateid || "",
            }));
        }

        const buyerOneData = reqBody.data.buyerOneData;

        console.log(nonBase64Urls, "nonBase64Urls")

        const updatedInvoice = await Invoice.findByIdAndUpdate(
            id,
            {
                Userid: userId,
                buyername: buyerOneData.buyername || buyerOneData[0].buyername,
                buyerEmail: buyerOneData.buyerEmail || buyerOneData[0].buyerEmail,
                buyerContact: buyerOneData.buyerContact || buyerOneData[0].buyerContact,
                buyerdob: buyerOneData.buyerdob || buyerOneData[0].buyerdob,
                buyerpassport: buyerOneData.buyerpassport || buyerOneData[0].buyerpassport,
                passportexpiry: buyerOneData.passportexpiry || buyerOneData[0].passportexpiry,
                nationality: buyerOneData.nationality || buyerOneData[0].nationality,
                Resident: buyerOneData.Resident || buyerOneData[0].Resident,
                emiratesExpiry: buyerOneData?.emiratesExpiry || buyerOneData[0]?.emiratesExpiry || "",
                emiratesid: buyerOneData?.emiratesid || buyerOneData[0]?.emiratesid || "",
                address: buyerOneData.address || buyerOneData[0].address,
                EOI: buyerOneData.tokenDate,
                Closure: buyerOneData.closureDate,
                Booking: buyerOneData.bookingDate,
                Handover: buyerOneData.handoverDate,
                Property: buyerOneData.propertyType,
                Developer: buyerOneData.developer,
                Bed: buyerOneData.Bed,
                BUA: buyerOneData.BUA,
                ProjectName: buyerOneData.ProjectName,
                PlotArea: buyerOneData.PlotArea,
                PlotNumber: buyerOneData.PlotNumber,
                Unitaddress: buyerOneData.Unitaddress,
                Price: buyerOneData.Price,
                type: buyerOneData.radioBtnStatus,
                Comission: buyerOneData.Comission,
                SpotCash: buyerOneData.SpotCash,
                TotalComission: buyerOneData.TotalComission,
                VAT: buyerOneData.VAT,
                ComissionVAT: buyerOneData.ComissionVAT,
                External: buyerOneData.External || buyerOneData[0].External,
                tokenDate: buyerOneData.tokenDate,
                closureDate: buyerOneData.closureDate,
                bookingDate: buyerOneData.bookingDate,
                handoverDate: buyerOneData.handoverDate,
                otherDeveloper: buyerOneData.otherDeveloper,
                commisionttype: buyerOneData.commisionttype,
                grandTotalCommission: buyerOneData.grandTotalCommission,
                netcom: buyerOneData.netcom,
                additionalBuyers,
                passfront: nonBase64Urls.length > 0 ? nonBase64Urls[0] : null,
                passback: nonBase64Urls.length > 1 ? nonBase64Urls[1] : null,
                emiratephoto: nonBase64Urls.length > 2 ? nonBase64Urls[2] : null,
                buyerImages: nonBase64Urls2,
                KYCimage: buyerOneKycImagesFileNames.length > 0 ? buyerOneKycImagesFileNames[0] : null,
                UNimage: buyerOneKycImagesFileNames.length > 1 ? buyerOneKycImagesFileNames[1] : null,
                Riskimage: buyerOneKycImagesFileNames.length > 2 ? buyerOneKycImagesFileNames[2] : null,
                Sanctionimage: buyerOneKycImagesFileNames.length > 3 ? buyerOneKycImagesFileNames[3] : null,
                additinalkyc: buyerkYCNames
            },
            { new: true }
        );

        return NextResponse.json({
            message: "Invoice created successfully",
            success: true,
            updatedInvoice,
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
