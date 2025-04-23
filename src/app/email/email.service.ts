/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    this.resend = new Resend(apiKey);
  }

  async sendMail(to: string, subject: string, html: string) {
    const from = this.configService.get('EMAIL_FROM');

    const { error } = await this.resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(`Error when try to send mail: ${error.message}`);
    }
  }
}
