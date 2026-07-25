import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter dynamically using SMTP_USER / EMAIL_USER environment variables
const getTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
  });
};

export const sendOutingApprovalEmail = async (data) => {
  const senderUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const senderPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromAddress = process.env.EMAIL_FROM || senderUser;

  // Check if SMTP credentials are provided
  if (!senderUser || !senderPass) {
    console.log('\x1b[36m[EmailService] (Mock - No SMTP Configured) Approval Email to:\x1b[0m', data.toEmail);
    console.log('Details:', JSON.stringify(data, null, 2));
    return;
  }

  const recipientEmail = data.toEmail;
  if (!recipientEmail) {
    console.error('\x1b[31m[EmailService Error] Cannot send email: No student recipient email address provided!\x1b[0m');
    return;
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: fromAddress,
    to: recipientEmail,
    subject: `Outing Approved - ${data.outingType || 'Outing Pass'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #4ade80; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #16a34a; margin-top: 0;">Your Outing Request is Approved ✅</h2>
        <p>Hello <strong>${data.studentName || 'Student'}</strong> (${data.studentId || ''}),</p>
        <p>Your ${data.outingType || 'Outing'} request to <strong>${data.destination}</strong> for <em>${data.purpose}</em> has been approved by your caretaker.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; background-color: #f8fafc; border-radius: 6px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; width: 40%;"><strong>Leaving Date & Time:</strong></td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${data.leavingDate} at ${data.leavingTime}</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Expected Return:</strong></td>
            <td style="padding: 10px;">${data.expectedReturn}</td>
          </tr>
        </table>
        
        <p><strong>Approved By:</strong> ${data.approvedByName} (${data.approvedByRole})</p>
        <div style="margin-top: 20px; padding: 12px; background-color: #f0fdf4; border-left: 4px solid #16a34a; color: #15803d; font-size: 13px;">
          📌 Please present your digital gate pass to the security guard when exiting and returning to campus.
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\x1b[32m[EmailService] Approval Email Sent successfully to:\x1b[0m', recipientEmail, '(ID:', info.messageId + ')');
    return info;
  } catch (error) {
    console.error('\x1b[31m[EmailService] Error sending approval email:\x1b[0m', error.message);
  }
};

export const sendOutingRejectionEmail = async (data) => {
  const senderUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const senderPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const fromAddress = process.env.EMAIL_FROM || senderUser;

  // Check if SMTP credentials are provided
  if (!senderUser || !senderPass) {
    console.log('\x1b[31m[EmailService] (Mock - No SMTP Configured) Rejection Email to:\x1b[0m', data.toEmail);
    console.log('Details:', JSON.stringify(data, null, 2));
    return;
  }

  const recipientEmail = data.toEmail;
  if (!recipientEmail) {
    console.error('\x1b[31m[EmailService Error] Cannot send email: No student recipient email address provided!\x1b[0m');
    return;
  }

  const transporter = getTransporter();

  const mailOptions = {
    from: fromAddress,
    to: recipientEmail,
    subject: `Outing Request Rejected - ${data.outingType || 'Outing Pass'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f87171; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #dc2626; margin-top: 0;">Your Outing Request was Rejected ❌</h2>
        <p>Hello <strong>${data.studentName || 'Student'}</strong> (${data.studentId || ''}),</p>
        <p>Your ${data.outingType || 'Outing'} request to <strong>${data.destination}</strong> was reviewed and rejected.</p>
        
        <div style="background-color: #fef2f2; color: #991b1b; padding: 12px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 15px 0;">
          <strong>Reason for Rejection:</strong><br>
          ${data.rejectionReason || 'No specific reason provided.'}
        </div>
        
        <p><strong>Rejected By:</strong> ${data.rejectedByName} (${data.rejectedByRole})</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\x1b[32m[EmailService] Rejection Email Sent successfully to:\x1b[0m', recipientEmail, '(ID:', info.messageId + ')');
    return info;
  } catch (error) {
    console.error('\x1b[31m[EmailService] Error sending rejection email:\x1b[0m', error.message);
  }
};
