import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a role name'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    permissions: {
      type: [String],
      default: [],
      // Example: ['user.read', 'user.create', 'report.view', 'billing.manage']
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Role', roleSchema);

