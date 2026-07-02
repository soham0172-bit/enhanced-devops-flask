"""
Tests for all /jobs routes and /health.
Run with: pytest tests/ --cov=app --cov-report=term
"""
from unittest.mock import patch, MagicMock
import json


# ─── Health ───────────────────────────────────────────────────────────────────

def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_root_api_metadata(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_cors_allows_local_frontend(client):
    resp = client.options(
        "/jobs",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert resp.status_code == 200
    assert resp.headers["Access-Control-Allow-Origin"] == "http://localhost:3000"


# ─── POST /jobs ───────────────────────────────────────────────────────────────

def test_add_job_success(client):
    resp = client.post("/jobs", json={
        "company": "TechCorp",
        "role": "DevOps Intern",
        "job_description": "Docker, GitHub Actions, Linux required.",
    })
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["job"]["company"] == "TechCorp"
    assert data["job"]["status"] == "applied"   # default status


def test_add_job_missing_fields(client):
    resp = client.post("/jobs", json={"company": "TechCorp"})
    assert resp.status_code == 422
    assert "Missing required fields" in resp.get_json()["error"]


def test_add_job_invalid_status(client):
    resp = client.post("/jobs", json={
        "company": "TechCorp",
        "role": "DevOps Intern",
        "job_description": "Docker, GitHub Actions, Linux required.",
        "status": "unknown",
    })
    assert resp.status_code == 400
    assert "allowed_statuses" in resp.get_json()


def test_add_job_no_body(client):
    resp = client.post("/jobs", content_type="application/json", data="")
    assert resp.status_code == 400


# ─── GET /jobs ────────────────────────────────────────────────────────────────

def test_list_jobs_empty(client):
    resp = client.get("/jobs")
    assert resp.status_code == 200
    assert resp.get_json()["count"] == 0


def test_list_jobs_returns_all(client, sample_job):
    resp = client.get("/jobs")
    assert resp.get_json()["count"] == 1


def test_list_jobs_filter_by_status(client, sample_job):
    # Update job to interview
    client.patch(f"/jobs/{sample_job['id']}", json={"status": "interview"})
    resp = client.get("/jobs?status=interview")
    assert resp.get_json()["count"] == 1

    resp2 = client.get("/jobs?status=applied")
    assert resp2.get_json()["count"] == 0


def test_list_jobs_invalid_status(client):
    resp = client.get("/jobs?status=unknown")
    assert resp.status_code == 400


# ─── GET /jobs/<id> ───────────────────────────────────────────────────────────

def test_get_job(client, sample_job):
    resp = client.get(f"/jobs/{sample_job['id']}")
    assert resp.status_code == 200
    assert resp.get_json()["company"] == "Acme Corp"


def test_get_job_not_found(client):
    resp = client.get("/jobs/999")
    assert resp.status_code == 404


# ─── PATCH /jobs/<id> ────────────────────────────────────────────────────────

def test_update_status(client, sample_job):
    resp = client.patch(f"/jobs/{sample_job['id']}", json={"status": "interview"})
    assert resp.status_code == 200
    assert resp.get_json()["job"]["status"] == "interview"


def test_update_invalid_status(client, sample_job):
    resp = client.patch(f"/jobs/{sample_job['id']}", json={"status": "ghosted"})
    assert resp.status_code == 400


def test_update_not_found(client):
    resp = client.patch("/jobs/999", json={"status": "offer"})
    assert resp.status_code == 404


# ─── DELETE /jobs/<id> ───────────────────────────────────────────────────────

def test_delete_job(client, sample_job):
    resp = client.delete(f"/jobs/{sample_job['id']}")
    assert resp.status_code == 200
    # Confirm it's gone
    assert client.get(f"/jobs/{sample_job['id']}").status_code == 404


def test_delete_not_found(client):
    resp = client.delete("/jobs/999")
    assert resp.status_code == 404


# ─── POST /jobs/<id>/score ───────────────────────────────────────────────────

def _mock_claude_response(score=82):
    """Build a fake Claude API response object."""
    mock = MagicMock()
    mock.raise_for_status = MagicMock()
    mock.json.return_value = {
        "content": [{
            "text": json.dumps({
                "score": score,
                "strengths": ["Strong Python skills", "Docker experience"],
                "gaps": ["No Kubernetes experience"],
                "summary": "Strong candidate. Minor gaps in cloud orchestration.",
            })
        }]
    }
    return mock


def test_score_job_success(client, sample_job):
    with patch("app.routes.CLAUDE_API_KEY", "fake-key"), \
         patch("app.routes.requests.post", return_value=_mock_claude_response(82)):
        resp = client.post(
            f"/jobs/{sample_job['id']}/score",
            json={"resume_text": "Python developer with Flask and Docker experience."},
        )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["score"] == 82
    assert len(data["strengths"]) > 0


def test_score_job_no_resume(client, sample_job):
    with patch("app.routes.CLAUDE_API_KEY", "fake-key"):
        resp = client.post(f"/jobs/{sample_job['id']}/score", json={})
    assert resp.status_code == 422


def test_score_job_no_api_key(client, sample_job):
    with patch("app.routes.CLAUDE_API_KEY", ""):
        resp = client.post(
            f"/jobs/{sample_job['id']}/score",
            json={"resume_text": "Some resume text"},
        )
    assert resp.status_code == 500


def test_score_job_not_found(client):
    with patch("app.routes.CLAUDE_API_KEY", "fake-key"):
        resp = client.post("/jobs/999/score", json={"resume_text": "test"})
    assert resp.status_code == 404


# ─── GET /jobs/stats ──────────────────────────────────────────────────────────

def test_stats_empty(client):
    resp = client.get("/jobs/stats")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total_jobs"] == 0
    assert data["average_ai_score"] is None


def test_stats_with_jobs(client, sample_job):
    resp = client.get("/jobs/stats")
    data = resp.get_json()
    assert data["total_jobs"] == 1
    assert data["by_status"]["applied"] == 1
