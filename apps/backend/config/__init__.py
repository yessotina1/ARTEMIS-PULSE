try:
    from .celery import app as celery_app
except ImportError:  # Celery is only required for the worker, not for the API process.
    celery_app = None

__all__ = ("celery_app",)
