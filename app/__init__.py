import os

from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from prometheus_flask_exporter import PrometheusMetrics
from flask_cors import CORS

db = SQLAlchemy()
metrics = PrometheusMetrics.for_app_factory()


def _cors_origins():
    configured = os.environ.get("CORS_ORIGINS")
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]

    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


def create_app(config=None):
    app = Flask(__name__)

    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", "sqlite:///jobs.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_SORT_KEYS=False,
    )
    if config:
        app.config.update(config)

    CORS(
        app,
        resources={
            r"/*": {
                "origins": _cors_origins(),
                "methods": ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
            }
        },
    )

    db.init_app(app)
    metrics.init_app(app)

    from app.routes import jobs_bp, health_bp

    app.register_blueprint(jobs_bp)
    app.register_blueprint(health_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def index():
        return jsonify({
            "name": "Enhanced DevOps Job Tracker API",
            "status": "ok",
            "endpoints": ["/health", "/jobs", "/jobs/stats", "/metrics"],
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    return app
