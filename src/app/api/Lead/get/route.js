import getDataFromToken from "@/helpers/getDataFromtoken";
import { NextRequest, NextResponse } from "next/server";
import Leads from "@/models/Leads";
import connect from "@/dbConfig/dbConfig";

connect();

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const skip = (page - 1) * limit;

        const leads = await Leads.find()
            .populate('tags marketingtags Assigned')
            .skip(skip)
            .limit(limit);
        const totalLeads = await Leads.countDocuments();

        return NextResponse.json({
            mesaaage: "Leads found",
            data: leads,
            totalLeads: totalLeads
        })

    }
    catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}