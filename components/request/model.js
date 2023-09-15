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
    const existingCount = await mongoose.models.Request.countDocuments({});
    console.log("🚀 ~ file: model.js:45 ~ generateAndSetSerialNumber ~ existingCount:", existingCount)
    const serialNumber = existingCount > 0 ? String(existingCount + 1).padStart(4, '0') : '0000';
    console.log("🚀 ~ file: model.js:50 ~ generateAndSetSerialNumber ~ serialNumber:", serialNumber)
    return serialNumber;
  } catch (error) {
    throw error; // Handle the error appropriately
  }
}

RequestSchema.pre('save', async function () {
  // Check if the document is new or being updated
  if (this.isNew) {
    try {
      const doc = this;
      const serialNumber = await generateAndSetSerialNumber();
      doc.serial = serialNumber;
    } catch (error) {
      console.log("🚀 ~ file: model.js:62 ~ error:", error)
    }
  }
});

export default mongoose.model('Request', RequestSchema, 'request');