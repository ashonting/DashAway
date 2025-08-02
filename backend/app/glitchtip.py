import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from fastapi import Request
import logging

def init_glitchtip():
    """Initialize GlitchTip (Sentry) for error tracking."""
    
    # Check if DSN is configured
    dsn = os.getenv("GLITCHTIP_DSN")
    if not dsn:
        logging.warning("GlitchTip DSN not configured - error tracking disabled")
        return
    
    # Initialize Sentry SDK
    sentry_sdk.init(
        dsn=dsn,
        
        # Set environment
        environment=os.getenv("ENVIRONMENT", "production"),
        
        # Performance monitoring (lower rate for production)
        traces_sample_rate=0.1,
        
        # Integrations
        integrations=[
            FastApiIntegration(auto_enabling_integrations=False),
            SqlalchemyIntegration(),
        ],
        
        # Error filtering
        before_send=filter_errors,
        
        # Additional configuration
        attach_stacktrace=True,
        send_default_pii=False,  # Don't send personally identifiable info
    )
    
    logging.info("GlitchTip error tracking initialized")

def filter_errors(event, hint):
    """Filter out errors we don't want to track."""
    
    # Don't track in development
    if os.getenv("ENVIRONMENT") == "development":
        return None
    
    # Get the exception
    if 'exc_info' in hint:
        exc_type, exc_value, tb = hint['exc_info']
        
        # Skip common HTTP client errors
        if exc_type.__name__ in [
            'HTTPException',
            'ValidationError',
            'RequestValidationError'
        ]:
            # Only track 5xx errors, not 4xx client errors
            if hasattr(exc_value, 'status_code'):
                if 400 <= exc_value.status_code < 500:
                    return None
        
        # Skip database connection errors that are temporary
        error_message = str(exc_value).lower()
        if any(msg in error_message for msg in [
            'connection refused',
            'connection timeout',
            'connection reset',
            'connection closed'
        ]):
            return None
    
    return event

def capture_exception(error: Exception, context: dict = None):
    """Manually capture an exception with optional context."""
    with sentry_sdk.configure_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_context(key, value)
        sentry_sdk.capture_exception(error)

def capture_message(message: str, level: str = "info", context: dict = None):
    """Capture a message with optional context."""
    with sentry_sdk.configure_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_context(key, value)
        sentry_sdk.capture_message(message, level=level)

def set_user_context(user_id: str, email: str = None, extra: dict = None):
    """Set user context for error tracking."""
    user_data = {"id": user_id}
    if email:
        user_data["email"] = email
    if extra:
        user_data.update(extra)
    
    sentry_sdk.set_user(user_data)

def add_breadcrumb(message: str, category: str = "custom", data: dict = None):
    """Add a breadcrumb for debugging context."""
    sentry_sdk.add_breadcrumb(
        message=message,
        category=category,
        data=data or {},
    )

# Middleware to add request context
def add_request_context(request: Request):
    """Add request context to error tracking."""
    with sentry_sdk.configure_scope() as scope:
        scope.set_context("request", {
            "url": str(request.url),
            "method": request.method,
            "headers": dict(request.headers),
            "query_params": dict(request.query_params),
        })

# Custom exception handler for better error tracking
async def glitchtip_exception_handler(request: Request, exc: Exception):
    """Custom exception handler that captures errors to GlitchTip."""
    
    # Add request context
    add_request_context(request)
    
    # Capture the exception
    capture_exception(exc, {
        "request_info": {
            "url": str(request.url),
            "method": request.method,
            "user_agent": request.headers.get("user-agent"),
        }
    })
    
    # Re-raise the exception to let FastAPI handle it
    raise exc