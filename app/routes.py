import os
import json
import requests
from flask import Blueprint, request, jsonify
from app import db
from app.models import Job

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")
health_bp = Blueprint("health", __name__)

CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"
CLAUDE_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

ALLOWED_STATUSES = {"applied", "interview", "offer", "rejected", "saved"}


# ─── Health check ────────────────────────────────────────────────────────────
# GitHub Actions calls this after deploy to confirm the app is alive

@health_bp.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


# ─── GET /jobs ────────────────────────────────────────────────────────────────
# Returns all jobs. Optional ?status= filter e.g. /jobs?status=interview

@jobs_bp.get("")
def list_jobs():
    status_filter = request.args.get("status")

    query = Job.query
    if status_filter:
        if status_filter not in ALLOWED_STATUSES:
            return jsonify({"error": f"Invalid status. Choose from: {ALLOWED_STATUSES}"}), 400
        query = query.filter_by(status=status_filter)

    jobs = query.order_by(Job.created_at.desc()).all()
    return jsonify({"jobs": [j.to_dict() for j in jobs], "count": len(jobs)}), 200


# ─── POST /jobs ───────────────────────────────────────────────────────────────
# Add a new job to track. Requires company, role, job_description in JSON body.

@jobs_bp.post("")
def add_job():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Request body must be JSON"}), 400

    required = ["company", "role", "job_description"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {missing}"}), 422

    job = Job(
        company=data["company"],
        role=data["role"],
        job_description=data["job_description"],
        url=data.get("url"),
        location=data.get("location", "Remote"),
        status=data.get("status", "applied"),
    )
    db.session.add(job)
    db.session.commit()

    return jsonify({"message": "Job added", "job": job.to_dict()}), 201


# ─── GET /jobs/<id> ───────────────────────────────────────────────────────────

@jobs_bp.get("/<int:job_id>")
def get_job(job_id):
    job = db.session.get(Job, job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job.to_dict()), 200


# ─── PATCH /jobs/<id> ─────────────────────────────────────────────────────────
# Update status or any field. e.g. {"status": "interview"}

@jobs_bp.patch("/<int:job_id>")
def update_job(job_id):
    job = db.session.get(Job, job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    data = request.get_json(silent=True) or {}
    if "status" in data:
        if data["status"] not in ALLOWED_STATUSES:
            return jsonify({"error": f"Invalid status. Choose from: {ALLOWED_STATUSES}"}), 400
        job.status = data["status"]

    for field in ["company", "role", "url", "location"]:
        if field in data:
            setattr(job, field, data[field])

    db.session.commit()
    return jsonify({"message": "Job updated", "job": job.to_dict()}), 200


# ─── DELETE /jobs/<id> ────────────────────────────────────────────────────────

@jobs_bp.delete("/<int:job_id>")
def delete_job(job_id):
    job = db.session.get(Job, job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    db.session.delete(job)
    db.session.commit()
    return jsonify({"message": "Job deleted"}), 200


# ─── POST /jobs/<id>/score ───────────────────────────────────────────────────
# THE AI ENDPOINT — sends resume + job description to Claude, gets back a
# fit score (0-100) and written feedback. Stores result on the job row.

@jobs_bp.post("/<int:job_id>/score")
def score_job(job_id):
    job = db.session.get(Job, job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    data = request.get_json(silent=True) or {}
    resume_text = data.get("resume_text", "")
    if not resume_text.strip():
        return jsonify({"error": "resume_text is required in request body"}), 422

    if not CLAUDE_API_KEY:
        return jsonify({"error": "ANTHROPIC_API_KEY not set on server"}), 500

    prompt = f"""You are a senior tech recruiter. Score how well this resume fits the job description.

JOB DESCRIPTION:
{job.job_description}

RESUME:
{resume_text}

Respond ONLY with a valid JSON object like this (no markdown, no explanation outside JSON):
{{
  "score": <integer 0-100>,
  "strengths": ["<point>", "<point>"],
  "gaps": ["<point>", "<point>"],
  "summary": "<2 sentence overall assessment>"
}}"""

    try:
        response = requests.post(
            CLAUDE_API_URL,
            headers={
                "x-api-key": CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 1000,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=30,
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Claude API call failed: {str(e)}"}), 502

    raw_text = response.json()["content"][0]["text"]

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        return jsonify({"error": "Claude returned invalid JSON", "raw": raw_text}), 502

    job.ai_score = result.get("score")
    job.ai_feedback = json.dumps(result)
    db.session.commit()

    return jsonify({
        "message": "Score saved",
        "job_id": job_id,
        "score": result.get("score"),
        "strengths": result.get("strengths"),
        "gaps": result.get("gaps"),
        "summary": result.get("summary"),
    }), 200


# ─── GET /jobs/stats ──────────────────────────────────────────────────────────
# Dashboard numbers — how many in each stage, average AI score

@jobs_bp.get("/stats")
def stats():
    total = Job.query.count()
    by_status = {}
    for status in ALLOWED_STATUSES:
        by_status[status] = Job.query.filter_by(status=status).count()

    scored_jobs = Job.query.filter(Job.ai_score.isnot(None)).all()
    avg_score = (
        round(sum(j.ai_score for j in scored_jobs) / len(scored_jobs), 1)
        if scored_jobs else None
    )

    return jsonify({
        "total_jobs": total,
        "by_status": by_status,
        "average_ai_score": avg_score,
        "scored_count": len(scored_jobs),
    }), 200