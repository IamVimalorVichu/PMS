import pytest
from pms.services.student_services import student_mgr
from pms.services.job_services import job_mgr
from pms.models.student import Student
from pms.models.job import Job

@pytest.mark.asyncio
async def test_add_student(mock_db):
    student = Student(
        user_id="123",
        first_name="John",
        email="john@example.com",
        program="MCA"
    )
    await student_mgr.initialize()
    result = await student_mgr.add_student(student)
    assert result["status"] == "success"
    assert "Student added with id" in result["message"]

@pytest.mark.asyncio
async def test_get_student(mock_db):
    await student_mgr.initialize()
    student = await student_mgr.get_student_by_user_id("123")
    assert student["first_name"] == "John"
    assert student["email"] == "john@example.com"
