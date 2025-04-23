from datetime import date, datetime
from pydantic import BaseModel, EmailStr, constr, Field
from typing import Dict, Literal, Optional, Annotated, List


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    email: EmailStr
    role: Literal["admin", "faculty", "student", "alumni"]
    status: Literal["Active", "Inactive"]







	
    
    




