import secrets
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import resend

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")


class OTPService:
    """Handle OTP generation and email sending"""

    def __init__(self):
        self.app_name = os.getenv("APP_NAME", "Ovula")
        self.app_url = os.getenv("APP_URL", "http://localhost:3000")

    # ---------------- OTP ----------------
    @staticmethod
    def generate_otp() -> str:
        return secrets.token_hex(3)

    @staticmethod
    def get_expiry_time(minutes: int = 5):
        return datetime.utcnow() + timedelta(minutes=minutes)

    # ---------------- EMAIL ----------------
    def send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        try:
            resend.Emails.send({
                "from": f"{self.app_name} <onboarding@resend.dev>",
                "to": to_email,
                "subject": subject,
                "html": html_content
            })

            print("Email sent successfully")
            return True

        except Exception as e:
            print("Email error:", e)
            return False

    def send_verification_email(self, username: str, email: str, otp_code: str) -> bool:
        subject = f"Verify your {self.app_name} account"

        html = f"""
        <h2>Hello {username}</h2>
        <p>Your OTP is:</p>
        <h1>{otp_code}</h1>
        <p>This expires in 5 minutes.</p>
        """

        return self.send_email(email, subject, html)

    def send_resend_email(self, username: str, email: str, otp_code: str) -> bool:
        subject = f"New OTP - {self.app_name}"

        html = f"""
        <h2>New OTP for {username}</h2>
        <h1>{otp_code}</h1>
        <p>Valid for 5 minutes.</p>
        """

        return self.send_email(email, subject, html)

    # ---------------- CLEANUP ----------------
    @staticmethod
    def cleanup_expired_otps(db_session):
        from models import OTPToken

        deleted = db_session.query(OTPToken).filter(
            (OTPToken.otp_expires_at < datetime.utcnow()) |
            (OTPToken.is_used == True) |
            (OTPToken.created_at < datetime.utcnow() - timedelta(hours=24))
        ).delete(synchronize_session=False)

        db_session.commit()
        return deleted


otp_service = OTPService()