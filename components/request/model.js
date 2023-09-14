import mongoose, { Schema } from 'mongoose';

export const Tier = {
  Tier1: 'Tier1',
  Tier2: 'Tier2',
  Tier3: 'Tier3',
};

const RequestSchema = new Schema({
  isCompleted: {
    type: Boolean,
    default: false,
  },
  serial: {
    type: String,
    required: true,
    unique: true,
  },
  tier: {
    type: Object.keys(Tier),
    required: true,
    default: Tier.Tier1,
  },
  amount: {
    type: Number,
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

async function generateAndSetSerialNumber() {
  try {
    const existingCount = await RequestSchema.countDocuments({});
    const serialNumber = String(existingCount + 1).padStart(4, '0');
    return serialNumber;
  } catch (error) {
    throw error; // Handle the error appropriately
  }
}

RequestSchema.pre('save', async function (next) {
  // Check if the document is new or being updated
  if (this.isNew) {
    try {
      const doc = this;
      const serialNumber = await generateAndSetSerialNumber();
      doc.serial = serialNumber;
      next();
    } catch (error) {
      next(error); // Pass the error to the next middleware or handler
    }
  } else {
    next();
  }
});

export default mongoose.model('Request', RequestSchema, 'request');