import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { Parcel } from 'src/database/entities/parcel.entity';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('email.resendApiKey'));
  }

  async sendTrackingCreated(parcel: Parcel) {
    const trackingUrl = `${this.configService.get('frontend.url')}/track/${parcel.trackingId}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .tracking-id { font-size: 24px; font-weight: bold; color: #2563eb; margin: 20px 0; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Parcel is Registered! 🎉</h1>
          </div>
          <div class="content">
            <p>Hello ${parcel.sender.fullName},</p>
            <p>Your parcel has been successfully registered in our system.</p>

            <div class="info">
              <strong>Tracking ID:</strong>
              <div class="tracking-id">${parcel.trackingId}</div>
            </div>

            <div class="info">
              <strong>Destination:</strong> ${parcel.recipientAddress}<br>
              <strong>Estimated Delivery:</strong> ${parcel.estimatedDelivery ? new Date(parcel.estimatedDelivery).toDateString() : 'Calculating...'}<br>
              <strong>Border Fee:</strong> $${parcel.borderFee}
            </div>

            <a href="${trackingUrl}" class="btn">Track Your Parcel</a>

            <p>You'll receive updates when your parcel reaches key milestones.</p>

            <p>Best regards,<br>swipline Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.resend.emails.send({
      from: 'Swipline <tracking@swipline.com>',
      to: parcel.senderEmail,
      subject: `Your Tracking ID: ${parcel.trackingId}`,
      html,
    });
  }

  async sendStatusUpdate(parcel: Parcel, status: string) {
    const statusMessages = {
      at_border: `Your parcel has reached the border. Please pay the border fee to continue.`,
      border_cleared: `Border fee paid! Your parcel has cleared customs and is on its way.`,
      out_for_delivery: `Your parcel is out for delivery today!`,
      delivered: `🎉 Your parcel has been delivered!`,
    };

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Parcel Status Update</h2>
        <p><strong>Tracking ID:</strong> ${parcel.trackingId}</p>
        <p><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
        <p>${statusMessages[status] || 'Your parcel status has been updated.'}</p>
        <p><strong>Current Location:</strong> ${parcel.currentLocation}</p>
        <a href="${this.configService.get('frontend.url')}/track/${parcel.trackingId}"
           style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          View Details
        </a>
      </div>
    `;

    await this.resend.emails.send({
      from: 'Swipline <updates@swipline.com>',
      to: [parcel.senderEmail, parcel.recipientEmail],
      subject: `Update: Parcel ${parcel.trackingId} is ${status.replace('_', ' ')}`,
      html,
    });
  }

  async sendBorderFeeReminder(parcel: Parcel) {
    const paymentUrl = `${this.configService.get('frontend.url')}/pay/${parcel.trackingId}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">Border Fee Payment Required</h2>
        <p>Your parcel <strong>${parcel.trackingId}</strong> has reached the border and requires a fee payment of <strong>$${parcel.borderFee}</strong> to continue.</p>
        <p>Please pay within 48 hours to avoid delays.</p>
        <a href="${paymentUrl}"
           style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Pay Border Fee Now
        </a>
        <p><small>If payment is not made within 48 hours, your parcel will be held at customs.</small></p>
      </div>
    `;

    await this.resend.emails.send({
      from: 'swipline <payments@swipline.com>',
      to: parcel.senderEmail,
      subject: `Action Required: Border Fee for ${parcel.trackingId}`,
      html,
    });
  }
}
