import random
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp, purpose):
    subject = "EWP Email Verification"
    if purpose == 'signup':
        message = f'''Dear User,

We received a request to verify your email address for your EWP account SignUp.

Your One-Time Password (OTP) is:

{otp}

This OTP is valid for the next 10 minutes. Please do not share this code with anyone for security reasons.

If you did not request this, please ignore this email. No changes will be made to your account.

For any assistance, feel free to contact our support team through ewp.communication@gmail.com.

Best regards,
EWP Team


Note: This is an automated message. Please do not reply directly to this email.
'''
    else:
        message = f'''Dear User,

We received a request to verify your email address for your EWP account password reset.

Your One-Time Password (OTP) is:

{otp}

This OTP is valid for the next 10 minutes. Please do not share this code with anyone for security reasons.

If you did not request this, please ignore this email. No changes will be made to your account.

For any assistance, feel free to contact our support team through ewp.communication@gmail.com.

Best regards,
EWP Team


Note: This is an automated message. Please do not reply directly to this email.
'''
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )

    # Invalidate old OTPs for this purpose
    OTP.objects.filter(email=email, purpose=purpose).delete()
    
    # Save new OTP
    OTP.objects.create(email=email, otp=otp, purpose=purpose)
