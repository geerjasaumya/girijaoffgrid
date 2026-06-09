import resend
from .config import settings

resend.api_key = settings.RESEND_API_KEY

def send_invite_email_to_add_user(email: str, code: str, role: str):
    resend.Emails.send({
        "from": "Girija <noreply@girijaoffgrid.com>",
        "to": email,
        "subject": "You've been invited to girijaoffgrid.com",
        "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>You've been invited!</h2>
                <p>You have been invited to join <strong>girijaoffgrid.com</strong> as a <strong>{role}</strong>.</p>
                <p>Use the code below to sign up:</p>
                <div style="background: #f4f4f4; padding: 16px; border-radius: 8px; font-size: 24px; letter-spacing: 4px; text-align: center;">
                    <strong>{code}</strong>
                </div>
                <p>This code expires in 48 hours and can only be used once.</p>
                <p>Go to <a href="https://girijaoffgrid.com/signup">girijaoffgrid.com/signup</a> to create your account.</p>
            </div>
        """
    })