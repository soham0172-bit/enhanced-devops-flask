from datetime import datetime
from app import db


class Job(db.Model):
    """One row = one job you are tracking."""
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    company = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(120), nullable=False)
    job_description = db.Column(db.Text, nullable=False)
    url = db.Column(db.String(500))
    location = db.Column(db.String(120), default="Remote")
    status = db.Column(
        db.String(30),
        default="applied",
        # allowed values: applied | interview | offer | rejected | saved
    )
    ai_score = db.Column(db.Integer)          # 0-100, filled by /score endpoint
    ai_feedback = db.Column(db.Text)          # AI reasoning text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "company": self.company,
            "role": self.role,
            "url": self.url,
            "location": self.location,
            "status": self.status,
            "ai_score": self.ai_score,
            "ai_feedback": self.ai_feedback,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }