import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Send registration confirmation email
export const sendRegistrationEmail = async (studentEmail, studentName, eventTitle, qrCodeBuffer, qrCodeString) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'MUES Events <onboarding@resend.dev>',
      to: studentEmail,
      subject: `Registration Confirmed: ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #003262; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background: #f9f9f9; }
              .qr-code { text-align: center; margin: 30px 0; padding: 20px; background: white; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Registration Confirmed!</h1>
              </div>
              <div class="content">
                <h2>Hi ${studentName},</h2>
                <p>You're successfully registered for:</p>
                <h3>${eventTitle}</h3>
                <p><strong>Your unique check-in code:</strong> ${qrCodeString}</p>
                <div class="qr-code">
                  <p><strong>Your QR Code is attached to this email</strong></p>
                  <p>Save it to your phone and show it at the event for check-in!</p>
                </div>
                <p>We're excited to see you there! If you have any questions, please contact the MUES team.</p>
              </div>
              <div class="footer">
                <p>Metropolitan Undergraduate Engineering Society (MUES)</p>
                <p>Toronto Metropolitan University</p>
              </div>
            </div>
          </body>
        </html>
      `,
      attachments: [
        {
          filename: 'qr-code.png',
          content: qrCodeBuffer,
        },
      ],
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    console.log('✅ Email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
};