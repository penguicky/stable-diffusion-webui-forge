"""
Common Imports Package for Forge WebUI

This package provides organized access to commonly used imports across
the Forge WebUI codebase, reducing redundancy and improving maintainability.

Usage Examples:
    # Import specific categories
    from modules.common_imports.core import torch, np, gr
    from modules.common_imports.stdlib import os, sys, json
    from modules.common_imports.forge import shared, errors
    
    # Import everything (for backward compatibility)
    from modules.common_imports import *
    
    # Check availability
    from modules.common_imports import check_availability
    if check_availability('torch'):
        # Use torch functionality
        pass
"""

# Import all sub-modules
from .core import *
from .stdlib import *
from .forge import *

# Combine availability flags
from .core import CORE_AVAILABILITY
from .forge import FORGE_AVAILABILITY

ALL_AVAILABILITY = {**CORE_AVAILABILITY, **FORGE_AVAILABILITY}

def check_availability(module_name: str) -> bool:
    """Check if a module is available for import"""
    return ALL_AVAILABILITY.get(module_name, False)

def get_available_modules():
    """Get list of all available modules"""
    return [name for name, available in ALL_AVAILABILITY.items() if available]

def get_unavailable_modules():
    """Get list of all unavailable modules"""
    return [name for name, available in ALL_AVAILABILITY.items() if not available]

def print_availability_report():
    """Print a report of module availability"""
    available = get_available_modules()
    unavailable = get_unavailable_modules()
    
    print("=" * 60)
    print("COMMON IMPORTS AVAILABILITY REPORT")
    print("=" * 60)
    print(f"Available modules ({len(available)}): {', '.join(available)}")
    if unavailable:
        print(f"Unavailable modules ({len(unavailable)}): {', '.join(unavailable)}")
    print(f"Total availability: {len(available)}/{len(ALL_AVAILABILITY)} ({len(available)/len(ALL_AVAILABILITY)*100:.1f}%)")
    print("=" * 60)

# Export utility functions
__all__ = [
    'check_availability', 
    'get_available_modules', 
    'get_unavailable_modules',
    'print_availability_report',
    'ALL_AVAILABILITY'
]
