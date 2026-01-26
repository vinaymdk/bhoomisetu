from fastapi.testclient import TestClient
from app.main import app


def test_generate():
    client = TestClient(app)
    response = client.post("/generate", json={"prompt": "Hello"})
    assert response.status_code == 200
    data = response.json()
    assert "response" in data
    assert "confidence" in data
    assert "structured" in data
