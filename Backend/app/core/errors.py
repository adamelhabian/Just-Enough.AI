from fastapi import Request
from fastapi.responses import JSONResponse
import uuid

class APIError(Exception):
    def __init__(self, code, message, details=None, status_code=400):
        self.code = code
        self.message = message
        self.details = details
        self.status_code = status_code

class NotFoundError(APIError):
    def __init__(self, message="Resource not found"):
        super().__init__("NOT_FOUND", message, status_code=404)

class AuthorizationError(APIError):
    def __init__(self, message="Not authorized"):
        super().__init__("UNAUTHORIZED", message, status_code=403)

class ValidationError(APIError):
    def __init__(self, message, details=None):
        super().__init__("VALIDATION_ERROR", message, details, status_code=422)

class TenantIsolationError(APIError):
    def __init__(self):
        super().__init__("TENANT_ISOLATION_ERROR", "Cross-tenant access denied", status_code=403)

class ConflictError(APIError):
    def __init__(self, message="Resource conflict"):
        super().__init__("CONFLICT", message, status_code=409)

def global_exception_handler(request: Request, exc: Exception):
    req_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    if isinstance(exc, APIError):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": {"code": exc.code, "message": exc.message, "details": exc.details, "request_id": req_id}}
        )
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": str(exc), "request_id": req_id}}
    )
