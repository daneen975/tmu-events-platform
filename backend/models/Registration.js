import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    studentEmail: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      //match: [/@torontomu\.ca$|@ryerson\.ca$/, 'Must use TMU email']
    },
    studentName: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    program: {
      type: String,
      required: [true, 'Program is required'],
      enum: [
        'Computer Engineering',
        'Electrical Engineering',
        'Mechanical Engineering',
        'Industrial Engineering',
        'Biomedical Engineering',
        'Aerospace Engineering',
        'Chemical Engineering',
        'Civil Engineering',
        'Other'
      ]
    },
    studentNumber: {
      type: String,
      trim: true,
      default: ''
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ''
    },
    qrCode: {
      type: String,
      required: true,
      unique: true
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  {
    timestamps: true
  }
);

registrationSchema.index({ eventId: 1, studentEmail: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;