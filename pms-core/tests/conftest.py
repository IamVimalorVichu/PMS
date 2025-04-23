import pytest
from fastapi.testclient import TestClient
from mongomock import MongoClient
from pms.main import app
from pms.db.database import DatabaseConnection

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def mock_db():
    client = MongoClient()
    DatabaseConnection.client = client
    DatabaseConnection.db = client['test_db']
    return client
