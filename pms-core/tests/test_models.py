import pytest
from datetime import datetime
from pms.models.student import Student
from pms.models.job import Job
from pms.models.requirement import Requirement
from pms.models.student_performance import StudentPerformance

def test_student_model():
    student_data = {
        "user_id": "123",
        "first_name": "John",
        "email": "john@example.com",
        "program": "MCA"
    }
    student = Student(**student_data)
    assert student.user_id == "123"
    assert student.first_name == "John"
    assert student.email == "john@example.com"
    assert student.program == "MCA"

def test_job_model():
    job_data = {
        "company": "Test Company",
        "drive": "123",
        "title": "Software Engineer",
        "experience": 2
    }
    job = Job(**job_data)
    assert job.company == "Test Company"
    assert job.title == "Software Engineer"
    assert job.experience == 2
