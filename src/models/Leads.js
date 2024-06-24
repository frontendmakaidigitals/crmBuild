import mongoose from "mongoose";
import User from "./Users";

const LeadsSchema = new mongoose.Schema({
    LeadStatus: {
        type: String,
    },
    Source: {
        type: String,
    },
    Assigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    Name: {
        type: String,
    },
    Score: {
        type: Number,
        default: 0, // or whatever default value you want
    },
    Phone: {
        type: Number,
        required: [true, "Please provide a Phone"],
    },
    AltPhone: {
        type: Number,
        required: [true, "Please provide a AltPhone"],
    },
    Address: {
        type: String,
    },
    Email: {
        type: String,
        required: [true, "Please provide a Email"],
    },
    typeprop: {
        type: String,
    },
    City: {
        type: String,
    },

    Project: {
        type: String,
    },
    Budget: {
        type: Number,
    },
    Country: {
        type: String,
    },
    Location: {
        type: String,
    },
    ZipCode: {
        type: String,
    },

    Type: {
        type: String,
    },
    Description: {
        type: String,
    },
    status: {
        type: String,
        default: "new",
    },
    LeadType: {
        type: String,
    },
    scoreupdateby: {
        type: String,
    },
    Doneby: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    tags: { type: mongoose.Schema.Types.ObjectId, ref: 'Tags' },
    marketingtags: { type: mongoose.Schema.Types.ObjectId, ref: 'Tags' },
    unitnumber: {
        type: String,
    },
    statusCount: {
        type: Number,
        default: 0
    },
    LeadAssignedDate: {
        type: Date,
    },
});

const Leads = mongoose.models.Leads || mongoose.model("Leads", LeadsSchema);

export default Leads;
