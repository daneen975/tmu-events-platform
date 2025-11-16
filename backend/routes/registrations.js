import express from 'express';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { generateUniqueCode, generateQRCodeDataURL, generateQRCodeBuffer } from '../utils/qrcode.js';
import { sendRegistrationEmail } from '../utils/email.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/registrations
// @desc    Register a student for an event
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { eventId, studentEmail, studentName, program, studentNumber, phoneNumber } = req.body;

    // Find the event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is published
    if (event.status !== 'published') {
      return res.status(400).json({ message: 'Event is not open for registration' });
    }

    // Check if event is full
    if (event.currentRegistrations >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if student already registered
    const existingRegistration = await Registration.findOne({ eventId, studentEmail });

    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Generate unique QR code
    const qrCodeString = generateUniqueCode();
    const qrCodeDataURL = await generateQRCodeDataURL(qrCodeString);
    const qrCodeBuffer = await generateQRCodeBuffer(qrCodeString);

    // Create registration
    const registration = await Registration.create({
      eventId,
      studentEmail,
      studentName,
      program,
      studentNumber,
      phoneNumber,
      qrCode: qrCodeString,
    });

    // Update event registration count
    event.currentRegistrations += 1;
    await event.save();

    // Send confirmation email
    await sendRegistrationEmail(studentEmail, studentName, event.title, qrCodeBuffer, qrCodeString);

    res.status(201).json({
      message: 'Registration successful! Check your email for confirmation.',
      registration: {
        _id: registration._id,
        eventId: registration.eventId,
        studentName: registration.studentName,
        studentEmail: registration.studentEmail,
        qrCode: qrCodeDataURL,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for an event
// @access  Private (Admin only)
router.get('/event/:eventId', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ eventId: req.params.eventId })
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/registrations/student/:email
// @desc    Get all registrations for a student
// @access  Public
router.get('/student/:email', async (req, res) => {
  try {
    const registrations = await Registration.find({ studentEmail: req.params.email })
      .populate('eventId')
      .sort({ createdAt: -1 });

    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/registrations/checkin
// @desc    Check in a student using QR code
// @access  Private (Admin only)
router.post('/checkin', protect, async (req, res) => {
  try {
    const { qrCode } = req.body;

    const registration = await Registration.findOne({ qrCode })
      .populate('eventId', 'title date location');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid QR code' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ 
        message: 'Already checked in',
        checkedInAt: registration.checkedInAt
      });
    }

    // Mark as checked in
    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({
      message: 'Check-in successful!',
      student: {
        name: registration.studentName,
        email: registration.studentEmail,
        program: registration.program,
        event: registration.eventId.title,
        checkedInAt: registration.checkedInAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/registrations/:id
// @desc    Cancel a registration
// @access  Public (student can cancel their own)
router.delete('/:id', async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Update event count
    const event = await Event.findById(registration.eventId);
    if (event) {
      event.currentRegistrations -= 1;
      await event.save();
    }

    await Registration.deleteOne({ _id: req.params.id });

    res.json({ message: 'Registration cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;