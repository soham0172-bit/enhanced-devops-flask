from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from prometheus_flask_exporter import PrometheusMetrics

db = SQLAlchemy()
metrics = PrometheusMetrics.for_app_factory()

def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///jobs.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    metrics.init_app(app)

    from app.routes import jobs_bp, health_bp

    app.register_blueprint(jobs_bp)
    app.register_blueprint(health_bp)

    with app.app_context():
        db.create_all()

    return app