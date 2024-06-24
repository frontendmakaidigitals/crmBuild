import getDataFromToken from "@/helpers/getDataFromtoken";
import { NextRequest, NextResponse } from "next/server";
import Invoice from "@/models/invoice";
import User from "@/models/Users";
import connect from "@/dbConfig/dbConfig";

connect();

export async function GET(request, { params }) {
    const parentstaff = params.id;

    try {
        const users = await User.find({ PrentStaff: parentstaff });
         const userIds = users.map(user => user._id);
         userIds.push(parentstaff);

      const invoices = await Invoice.find({
            $or: [
                { Userid: { $in: userIds } },
                { approvedby: { $elemMatch: { $in: userIds } } }
            ]
        }).populate('Userid');
        console.log(invoices);
        return NextResponse.json({
            mesaaage: "invoices found",
            data: invoices,
            users:users
        })

    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}