import pytest
from mongoengine import connect, disconnect
import os

@pytest.fixture(autouse=True)
def setup_test_db():
    """Setup test database before each test"""
    disconnect()
    connect('testdb', host='mongodb://localhost:27017/testdb')
    yield
    disconnect()