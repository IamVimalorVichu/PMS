import pytest
from fastapi.testclient import TestClient

def test_get_students(test_client, mock_db):
    response = test_client.get("/student/get")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_add_student(test_client, mock_db):
    student_data = {
        "user_id": "123",
        "first_name": "John",
        "email": "john@example.com",
        "program": "MCA"
    }
    response = test_client.post("/student/add", json=student_data)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
