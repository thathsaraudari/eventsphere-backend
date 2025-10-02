const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const savedEventSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

savedEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = model('SavedEvent', savedEventSchema);
