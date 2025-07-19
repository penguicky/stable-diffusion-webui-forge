"""
Standardized Error Handling System for Forge WebUI

This module provides a unified error handling system that standardizes
exception handling patterns across the codebase. It extends the existing
error reporting system in modules/errors.py with:

- Custom exception hierarchy
- Decorators for consistent error handling
- Context managers for error boundaries
- Structured logging integration
- Error recovery mechanisms
"""

import functools
import logging
import sys
import traceback
from typing import Any, Callable, Optional, Type, Union, Dict
from contextlib import contextmanager

from modules import errors


class ForgeError(Exception):
    """Base exception class for Forge WebUI"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None, cause: Optional[Exception] = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}
        self.cause = cause
    
    def __str__(self):
        result = self.message
        if self.details:
            details_str = ", ".join(f"{k}={v}" for k, v in self.details.items())
            result += f" ({details_str})"
        if self.cause:
            result += f" [Caused by: {self.cause}]"
        return result


class DeviceError(ForgeError):
    """Exception for device-related errors"""
    pass


class ModelError(ForgeError):
    """Exception for model loading/processing errors"""
    pass


class ConfigurationError(ForgeError):
    """Exception for configuration-related errors"""
    pass


class ProcessingError(ForgeError):
    """Exception for image processing errors"""
    pass


class NetworkError(ForgeError):
    """Exception for network/API related errors"""
    pass


class ValidationError(ForgeError):
    """Exception for input validation errors"""
    pass


class ErrorHandler:
    """
    Centralized error handler that provides consistent error handling
    patterns across the application.
    """
    
    def __init__(self, logger_name: str = __name__):
        self.logger = logging.getLogger(logger_name)
    
    def handle_error(self, error: Exception, context: str = "", 
                    reraise: bool = True, error_type: Type[ForgeError] = ForgeError) -> Optional[ForgeError]:
        """
        Handle an error with consistent logging and optional re-raising.
        
        Args:
            error: The original exception
            context: Context information about where the error occurred
            reraise: Whether to re-raise the error as a ForgeError
            error_type: The type of ForgeError to raise
            
        Returns:
            ForgeError instance if reraise=False, None otherwise
        """
        # Create detailed error message
        error_msg = f"{context}: {error}" if context else str(error)
        
        # Log the error using the existing error reporting system
        errors.report(error_msg, exc_info=True)
        
        # Create structured error details
        details = {
            'original_error': type(error).__name__,
            'context': context,
        }
        
        # Create ForgeError instance
        forge_error = error_type(error_msg, details=details, cause=error)
        
        if reraise:
            raise forge_error
        else:
            return forge_error
    
    def safe_execute(self, operation: Callable, *args, default=None, 
                    context: str = "", error_type: Type[ForgeError] = ForgeError, **kwargs):
        """
        Execute an operation safely with error handling.
        
        Args:
            operation: The function to execute
            *args: Arguments for the operation
            default: Default value to return on error
            context: Context information
            error_type: Type of error to raise
            **kwargs: Keyword arguments for the operation
            
        Returns:
            Result of operation or default value on error
        """
        try:
            return operation(*args, **kwargs)
        except Exception as e:
            if default is not None:
                self.logger.warning(f"Operation failed, returning default: {context} - {e}")
                return default
            else:
                self.handle_error(e, context, reraise=True, error_type=error_type)


# Global error handler instance
error_handler = ErrorHandler()


def safe_operation(context: str = "", error_type: Type[ForgeError] = ForgeError, 
                  default=None, reraise: bool = True):
    """
    Decorator for consistent error handling across functions.
    
    Args:
        context: Context description for the operation
        error_type: Type of ForgeError to raise
        default: Default value to return on error (if reraise=False)
        reraise: Whether to re-raise errors
        
    Usage:
        @safe_operation("Loading model", ModelError)
        def load_model(path):
            # ... model loading code ...
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            operation_context = context or f"{func.__module__}.{func.__name__}"
            try:
                return func(*args, **kwargs)
            except Exception as e:
                if default is not None and not reraise:
                    error_handler.logger.warning(f"Operation failed, returning default: {operation_context} - {e}")
                    return default
                else:
                    error_handler.handle_error(e, operation_context, reraise=reraise, error_type=error_type)
        return wrapper
    return decorator


@contextmanager
def error_boundary(context: str = "", error_type: Type[ForgeError] = ForgeError, 
                  suppress: bool = False):
    """
    Context manager that creates an error boundary for a block of code.
    
    Args:
        context: Context description
        error_type: Type of ForgeError to raise
        suppress: Whether to suppress errors (log but don't re-raise)
        
    Usage:
        with error_boundary("Processing image", ProcessingError):
            # ... image processing code ...
    """
    try:
        yield
    except Exception as e:
        if suppress:
            error_handler.handle_error(e, context, reraise=False, error_type=error_type)
        else:
            error_handler.handle_error(e, context, reraise=True, error_type=error_type)


def validate_input(condition: bool, message: str, details: Optional[Dict[str, Any]] = None):
    """
    Validate input conditions and raise ValidationError if they fail.
    
    Args:
        condition: Condition that must be True
        message: Error message if condition fails
        details: Additional error details
        
    Raises:
        ValidationError: If condition is False
    """
    if not condition:
        raise ValidationError(message, details=details)


def handle_model_error(func: Callable) -> Callable:
    """Decorator specifically for model-related operations"""
    return safe_operation("Model operation", ModelError)(func)


def handle_device_error(func: Callable) -> Callable:
    """Decorator specifically for device-related operations"""
    return safe_operation("Device operation", DeviceError)(func)


def handle_processing_error(func: Callable) -> Callable:
    """Decorator specifically for processing operations"""
    return safe_operation("Processing operation", ProcessingError)(func)


def handle_config_error(func: Callable) -> Callable:
    """Decorator specifically for configuration operations"""
    return safe_operation("Configuration operation", ConfigurationError)(func)


# Legacy compatibility - maintain existing error reporting interface
def report_error(message: str, exc_info: bool = False):
    """Legacy compatibility function for error reporting"""
    errors.report(message, exc_info=exc_info)


def display_error(e: Exception, task: str = "", full_traceback: bool = False):
    """Legacy compatibility function for error display"""
    errors.display(e, task, full_traceback=full_traceback)


# Export commonly used functions and classes
__all__ = [
    # Exception classes
    'ForgeError', 'DeviceError', 'ModelError', 'ConfigurationError',
    'ProcessingError', 'NetworkError', 'ValidationError',
    
    # Main error handler
    'ErrorHandler', 'error_handler',
    
    # Decorators
    'safe_operation', 'handle_model_error', 'handle_device_error',
    'handle_processing_error', 'handle_config_error',
    
    # Context managers
    'error_boundary',
    
    # Utility functions
    'validate_input', 'report_error', 'display_error'
]
