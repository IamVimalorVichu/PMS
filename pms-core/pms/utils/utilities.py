import random, string
from passlib.context import CryptContext
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

# Add email configuration
email_conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv('MAIL_USERNAME'),
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD'),
    MAIL_FROM = os.getenv('MAIL_FROM'),
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587)),
    MAIL_SERVER = os.getenv('MAIL_SERVER'),
    MAIL_STARTTLS = True,     
    MAIL_SSL_TLS = False,    
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

class UtilMgr:
    def __init__(self) -> None:
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.fastmail = FastMail(email_conf)
        
    def generate_random_string(self,length: int = 10, chars: str = string.ascii_letters + string.digits):
        return ''.join(random.choice(chars) for _ in range(length))

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def hash_password(self, plain_password):
        return self.pwd_context.hash(plain_password)
    
    def generate_random_password(self, length: int = 10):
        return self.generate_random_string(length=length, chars=string.ascii_letters + string.digits + string.punctuation)

    async def send_email(self, email: EmailStr | List[EmailStr], subject: str, body: str):
        message = MessageSchema(
            subject=subject,
            recipients=[email] if isinstance(email, str) else email,
            body=body,
            subtype="html"
        )
        
        await self.fastmail.send_message(message)


util_mgr = UtilMgr()