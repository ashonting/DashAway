"""
Rate limiting middleware for API protection.
Prevents abuse and ensures fair usage across all users.
"""

import time
from typing import Callable, Dict, Any
from collections import defaultdict, deque
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class InMemoryRateLimiter:
    """In-memory rate limiter using sliding window approach."""
    
    def __init__(self):
        # Store request timestamps for each client
        # Format: {client_id: deque([timestamp1, timestamp2, ...])}
        self.clients: Dict[str, deque] = defaultdict(lambda: deque())
        
        # Last cleanup time to prevent memory leaks
        self.last_cleanup = time.time()
        
    def is_allowed(self, client_id: str, max_requests: int, window_seconds: int) -> bool:
        """Check if client is allowed to make request."""
        now = time.time()
        
        # Clean up old entries periodically (every 5 minutes)
        if now - self.last_cleanup > 300:
            self._cleanup_old_entries()
            self.last_cleanup = now
        
        # Get client's request history
        client_requests = self.clients[client_id]
        
        # Remove requests outside the time window
        cutoff_time = now - window_seconds
        while client_requests and client_requests[0] < cutoff_time:
            client_requests.popleft()
        
        # Check if under limit
        if len(client_requests) >= max_requests:
            return False
        
        # Add current request
        client_requests.append(now)
        return True
    
    def _cleanup_old_entries(self):
        """Remove clients with no recent requests to prevent memory leaks."""
        now = time.time()
        cutoff_time = now - 3600  # Remove clients inactive for 1 hour
        
        clients_to_remove = []
        for client_id, requests in self.clients.items():
            # Remove old requests
            while requests and requests[0] < cutoff_time:
                requests.popleft()
            
            # If no recent requests, mark for removal
            if not requests:
                clients_to_remove.append(client_id)
        
        # Remove inactive clients
        for client_id in clients_to_remove:
            del self.clients[client_id]
        
        if clients_to_remove:
            logger.info(f"Cleaned up {len(clients_to_remove)} inactive rate limit clients")


# Global rate limiter instance
rate_limiter = InMemoryRateLimiter()


def get_client_identifier(request: Request) -> str:
    """Get unique identifier for the client."""
    # Try to get user ID from JWT token if authenticated
    if hasattr(request.state, 'user_id') and request.state.user_id:
        return f"user:{request.state.user_id}"
    
    # Fall back to IP address
    # Handle proxy headers for real IP
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        # Get first IP from comma-separated list
        client_ip = forwarded_for.split(",")[0].strip()
    else:
        client_ip = request.client.host if request.client else "unknown"
    
    return f"ip:{client_ip}"


def create_rate_limit_middleware(
    max_requests: int,
    window_seconds: int,
    exempt_paths: list = None
) -> Callable:
    """Create rate limiting middleware with specified limits."""
    
    exempt_paths = exempt_paths or []
    
    async def rate_limit_middleware(request: Request, call_next):
        # Skip rate limiting for exempt paths
        if any(request.url.path.startswith(path) for path in exempt_paths):
            return await call_next(request)
        
        # Get client identifier
        client_id = get_client_identifier(request)
        
        # Check rate limit
        if not rate_limiter.is_allowed(client_id, max_requests, window_seconds):
            logger.warning(f"Rate limit exceeded for client: {client_id}")
            
            # Calculate retry after time
            retry_after = window_seconds
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Maximum {max_requests} requests per {window_seconds} seconds allowed.",
                    "retry_after": retry_after
                },
                headers={"Retry-After": str(retry_after)}
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Window"] = str(window_seconds)
        
        return response
    
    return rate_limit_middleware


# Specific rate limiters for different endpoints
async def api_rate_limit_middleware(request: Request, call_next):
    """General API rate limiting: 100 requests per minute."""
    return await create_rate_limit_middleware(
        max_requests=100,
        window_seconds=60,
        exempt_paths=["/docs", "/openapi.json", "/health", "/favicon.ico"]
    )(request, call_next)


async def analysis_rate_limit_middleware(request: Request, call_next):
    """Analysis endpoint rate limiting: 20 requests per minute."""
    if not request.url.path.startswith("/api/analysis"):
        return await call_next(request)
    
    return await create_rate_limit_middleware(
        max_requests=20,
        window_seconds=60
    )(request, call_next)


async def auth_rate_limit_middleware(request: Request, call_next):
    """Auth endpoint rate limiting: 5 requests per minute."""
    if not request.url.path.startswith("/api/auth"):
        return await call_next(request)
    
    return await create_rate_limit_middleware(
        max_requests=5,
        window_seconds=60
    )(request, call_next)