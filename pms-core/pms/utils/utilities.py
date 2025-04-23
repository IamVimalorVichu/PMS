import random, string
from passlib.context import CryptContext


class UtilMgr:
    def __init__(self) -> None:
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        
    def generate_random_string(self,length: int = 10, chars: str = string.ascii_letters + string.digits):
        return ''.join(random.choice(chars) for _ in range(length))

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def hash_password(self, plain_password):
        return self.pwd_context.hash(plain_password)


util_mgr = UtilMgr()