const { Schema, model } = require("mongoose");

const rsvpSchema = new Schema(
  {
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status:{
        type: String, 
        enum: ["reserved", "usecancelled"],
        default: "reserved"
    }
  },
  {  
    timestamps: {
        reservedAt: true, 
        updateAt: false,
    }
 }
);

const RSVP = model("RSVP", rsvpSchema);

module.exports = RSVP;
