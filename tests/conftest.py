import pytest
from app import create_app, db


@pytest.fixture
def app():
    """Create a fresh test app with an in-memory SQLite database."""
    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app):
    """Test client — use this in every test to make requests."""
    return app.test_client()


@pytest.fixture
def sample_job(client):
    """Insert one job and return it — avoids repeating POST setup in every test."""
    resp = client.post("/jobs", json={
        "company": "Acme Corp",
        "role": "Backend Intern",
        "job_description": "Python, Flask, Docker, CI/CD experience required.",
        "url": "https://acme.com/jobs/1",
        "location": "Remote",
    })
    return resp.get_json()["job"]