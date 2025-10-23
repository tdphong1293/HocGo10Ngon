import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

/*
    Cần include thư mục templates trong quá trình build
    để đảm bảo các file html được copy sang thư mục dist.
    Cấu hình trong nest-cli.json 
*/

@Injectable()
export class NodemailerService {
    private transporter;
    private templateCache = new Map<string, string>(); // Cache templates

    constructor(
        private readonly configService: ConfigService,
    ) {
        this.transporter = createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get('GMAIL_USER'),
                pass: this.configService.get('GMAIL_APP_PASSWORD'),
            },
        });
    }

    private getTemplate(templateName: string): string {
        if (this.templateCache.has(templateName)) {
            return this.templateCache.get(templateName)!;
        }

        const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
        const template = fs.readFileSync(templatePath, 'utf8');
        this.templateCache.set(templateName, template);

        return template;
    }

    private async sendTemplateEmail(to: string, subject: string, templateName: string, data: any) {
        let htmlTemplate = this.getTemplate(templateName);

        Object.keys(data).forEach(key => {
            const placeholder = new RegExp(`{{${key}}}`, 'g');
            htmlTemplate = htmlTemplate.replace(placeholder, data[key]);
        });

        const mailOptions = {
            from: this.configService.get('GMAIL_USER'),
            to,
            subject,
            html: htmlTemplate
        };

        await this.transporter.sendMail(mailOptions);
    }

    async sendOTPEmail(to: string, username: string, otpCode: string, expirationMinutes: number = 5) {
        await this.sendTemplateEmail(to, 'Mã xác thực OTP - Học Gõ 10 Ngón', 'otp-verification', {
            username,
            otpCode,
            expirationTime: expirationMinutes,
            supportEmail: this.configService.get('GMAIL_USER')
        });
    }
}