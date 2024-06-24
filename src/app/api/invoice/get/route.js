import getDataFromToken from "@/helpers/getDataFromtoken";
import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/invoice";
import User from "@/models/Users";
import connect from "@/dbConfig/dbConfig";

connect();

export async function GET(request) {

    try {
const invoices = await Invoice.find({}).populate('Userid').populate('approvedby');
        console.log(invoices);
        return NextResponse.json({
            mesaaage: "invoices found",
            data: invoices
        })

    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}