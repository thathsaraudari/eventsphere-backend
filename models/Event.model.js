const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const eventSchema = new Schema(
  {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    title:{
        type: String,
        required: [true, 'name is required.'],
        trim: true
    },
    description:{
        type: String,
        required: [true, 'description is required.'],
        trim: true
    },
    category:{
        type: String,
        required: [true, 'categoty is required.'],
        trim: true
    },
    startAt: {
        type: Date,
        required: true
    },
    endAt: {
        type: Date,
        required: true
    },
    price: {
        amount: { type: Number, default: 0 },
        currency: { 
            type: String, 
            enum: ["EUR", "USD", "GBP"], 
            uppercase: true }
    },
    capacity: {
        number: { type: Number, required: true, min: 1 },
        seatsRemaining: { type: Number, required: true }
    },
    location: {
        address: { type: String },
        city: { type: String, required: true},
        postCode: { type: String },
        country: { type: String, default: "Netherlands" },
        coords: { 
            type: { type: String, enum: ["Point"], default: "Point"},
            coordinates: { type: [Number], required: true }
            }
    },
    eventMode: {
        type: String,
        enum: ["Online", "Inperson"],
        required: true
    },
    venueType: {
        type: String,
        enum: ["Indoor", "Outdoor"],
        required: function () {
            return this.eventMode === "Inperson";
        }
    },
    coverUrl: { type: String },
 },
  {
    timestamps: true
  }
);

const Event = model("Event", eventSchema);

module.exports = Event;
