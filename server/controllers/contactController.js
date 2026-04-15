const sendEmail = require('../utils/sendEmail');
const sendResponse = require('../utils/sendResponse');

// @desc    Send contact form message
// @route   POST /api/contact/send
exports.sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return sendResponse(res, 400, false, null, 'Please provide all fields: name, email, message');
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@drape.com';

    await sendEmail({
      email: adminEmail,
      subject: `New Contact Request from ${name}`,
      message: `You have received a new message from the DRAPE contact form.\n\nSender: ${name} (${email})\n\nMessage:\n${message}`,
    });

    sendResponse(res, 200, true, null, 'Message sent successfully');
  } catch (error) {
    next(error);
  }
};
