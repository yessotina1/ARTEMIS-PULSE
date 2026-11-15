from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


class StorageNotConfigured(Exception):
    """Object storage credentials are absent."""


class Conflict(APIException):
    status_code = 409
    default_detail = "Conflit d'état."
    default_code = "CONFLICT"


_STATUS_CODES = {
    400: "VALIDATION_ERROR",
    401: "AUTHENTICATION_REQUIRED",
    403: "PERMISSION_DENIED",
    404: "NOT_FOUND",
    409: "CONFLICT",
    429: "THROTTLED",
}

_GENERIC_CODES = {
    "permission_denied",
    "not_authenticated",
    "authentication_failed",
    "not_found",
    "throttled",
    "error",
    "parse_error",
    "invalid",
}


def _stringify(value) -> str:
    if isinstance(value, list):
        return " ".join(_stringify(item) for item in value)
    if isinstance(value, dict):
        return " ".join(f"{key}: {_stringify(item)}" for key, item in value.items())
    return str(value)


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    request = context.get("request")
    request_id = getattr(request, "request_id", None)
    codes = exc.get_codes() if hasattr(exc, "get_codes") else None
    code = _STATUS_CODES.get(response.status_code, "ERROR")
    if isinstance(codes, str) and codes not in _GENERIC_CODES:
        code = codes

    payload = response.data
    if response.status_code == 400 and not (
        isinstance(payload, dict) and set(payload) == {"detail"}
    ):
        message = "Requête invalide."
        details = payload
    elif isinstance(payload, dict) and "detail" in payload:
        message = _stringify(payload["detail"])
        details = {}
    else:
        message = _stringify(payload)
        details = payload if isinstance(payload, dict) else {"detail": payload}

    response.data = {
        "error": {
            "code": code,
            "message": message,
            "details": details,
            "request_id": request_id,
        }
    }
    return response
