"""
OTP Service for Email Verification
Adapted from Django OTP Verification system
"""
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()


class OTPService:
    """Handle OTP generation, storage, and email sending"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.app_name = os.getenv("APP_NAME", "PCOS Tracker")
        self.app_url = os.getenv("APP_URL", "http://localhost:3000")
        
        # Email backend configuration
        self.email_backend = os.getenv("EMAIL_BACKEND", "console")  # console or smtp
        
        if self.email_backend == "console":
            print("\n" + "="*60)
            print("📧 EMAIL BACKEND: CONSOLE MODE (Development)")
            print("   OTP codes will be displayed in the terminal")
            print("="*60 + "\n")
    
    @staticmethod
    def generate_otp() -> str:
        """Generate a 6-character cryptographically secure OTP"""
        return secrets.token_hex(3)  # Returns 6 hex characters
    
    @staticmethod
    def is_otp_expired(expires_at: datetime) -> bool:
        """Check if OTP has expired"""
        return datetime.utcnow() > expires_at
    
    @staticmethod
    def get_expiry_time(minutes: int = 5) -> datetime:
        """Get OTP expiry time (default 5 minutes from now)"""
        return datetime.utcnow() + timedelta(minutes=minutes)
    
    def create_verification_email(self, username: str, email: str, otp_code: str) -> tuple:
        """Create HTML and plain text email for OTP verification"""
        
        # Plain text version
        text_message = f"""Welcome to {self.app_name}, {username}!

Thank you for registering. Your verification code is: {otp_code}

This code expires in 5 minutes.
Verify here: {self.app_url}/verify-email

Best regards,
The {self.app_name} Team
"""
        
        # HTML version
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                                💖 {self.app_name.upper()}
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #fce7f3; font-size: 14px;">Your Health, Our Priority</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                                Welcome, {username}! 👋
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Thank you for joining <strong>{self.app_name}</strong>. We're excited to have you on board! 
                                To complete your registration, please verify your email address.
                            </p>
                            
                            <p style="margin: 0 0 10px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                                Your verification code:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 8px; padding: 20px;">
                                        <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            {otp_code.upper()}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Timer Warning -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0; background-color: #fff5f5; border-left: 4px solid #f56565; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #742a2a; font-size: 14px;">
                                            ⏰ <strong>Important:</strong> This code expires in <strong>5 minutes</strong> for your security.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{self.app_url}/verify-email" 
                                           style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);">
                                            ✓ Verify My Account
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 20px 0; color: #ec4899; font-size: 13px; word-break: break-all;">
                                {self.app_url}/verify-email
                            </p>
                            
                            <!-- Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 0 0; background-color: #f7fafc; border-radius: 6px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #2d3748; font-size: 13px; font-weight: 600;">
                                            🔒 Security Notice
                                        </p>
                                        <p style="margin: 0; color: #4a5568; font-size: 13px; line-height: 1.5;">
                                            If you didn't create an account with {self.app_name}, please ignore this email. 
                                            Your security is important to us.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                                Best regards,<br>
                                <strong style="color: #ec4899;">The {self.app_name} Team</strong>
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2024 {self.app_name}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        
        return text_message, html_message
    
    def create_resend_email(self, username: str, email: str, otp_code: str) -> tuple:
        """Create HTML and plain text email for OTP resend"""
        
        # Plain text version
        text_message = f"""Hello {username},

You requested a new verification code. Your code is: {otp_code}

This code expires in 5 minutes.
Verify here: {self.app_url}/verify-email

Best regards,
The {self.app_name} Team
"""
        
        # HTML version with resend styling
        html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 1px;">
                                💖 {self.app_name.upper()}
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #fce7f3; font-size: 14px;">Your Health, Our Priority</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                                New Verification Code 🔄
                            </h2>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hello <strong>{username}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                You requested a new verification code for your {self.app_name} account. Here's your fresh code:
                            </p>
                            
                            <!-- OTP Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 8px; padding: 20px;">
                                        <span style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            {otp_code.upper()}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Timer Warning -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0; background-color: #fff5f5; border-left: 4px solid #f56565; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 15px 20px;">
                                        <p style="margin: 0; color: #742a2a; font-size: 14px;">
                                            ⏰ <strong>Hurry!</strong> This code expires in <strong>5 minutes</strong>.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{self.app_url}/verify-email" 
                                           style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4);">
                                            ✓ Verify Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Warning -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0 0 0; background-color: #fffaf0; border-left: 4px solid #ed8936; border-radius: 4px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 10px 0; color: #7c2d12; font-size: 13px; font-weight: 600;">
                                            ⚠️ Security Alert
                                        </p>
                                        <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                                            If you didn't request this code, please secure your account immediately. 
                                            Someone may be trying to access your account.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px;">
                                Best regards,<br>
                                <strong style="color: #ec4899;">The {self.app_name} Team</strong>
                            </p>
                            <p style="margin: 0; color: #a0aec0; font-size: 12px;">
                                © 2024 {self.app_name}. All rights reserved.
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        
        return text_message, html_message
    
    def send_email(self, to_email: str, subject: str, text_content: str, html_content: str) -> bool:
        """Send email with both text and HTML versions"""
        
        # Console backend for development
        if self.email_backend == "console":
            print("\n" + "="*70)
            print("📧 EMAIL CONSOLE OUTPUT (Development Mode)")
            print("="*70)
            print(f"From: {self.from_email}")
            print(f"To: {to_email}")
            print(f"Subject: {subject}")
            print("-"*70)
            print(text_content)
            print("="*70 + "\n")
            return True  # Return True for console mode
        
        # SMTP backend for production
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Attach both versions
            part1 = MIMEText(text_content, 'plain')
            part2 = MIMEText(html_content, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_verification_email(self, username: str, email: str, otp_code: str) -> bool:
        """Send OTP verification email"""
        text_content, html_content = self.create_verification_email(username, email, otp_code)
        subject = f"🔐 {self.app_name} - Verify Your Email Address"
        return self.send_email(email, subject, text_content, html_content)
    
    def send_resend_email(self, username: str, email: str, otp_code: str) -> bool:
        """Send OTP resend email"""
        text_content, html_content = self.create_resend_email(username, email, otp_code)
        subject = f"🔄 {self.app_name} - New Verification Code"
        return self.send_email(email, subject, text_content, html_content)


# Global instance
otp_service = OTPService()
