from __future__ import annotations

"""
Common Imports Module for Forge WebUI

This module consolidates frequently used imports across the codebase to reduce
redundancy and improve maintainability. Based on analysis of 151 Python files,
this module provides the most commonly used imports.

Usage:
    # For new modules, use selective imports:
    from modules.common_imports import torch, gradio as gr, shared, errors
    
    # For legacy compatibility, star import is available:
    from modules.common_imports import *
    
    # For specific categories:
    from modules.common_imports.core import torch, numpy, gradio
    from modules.common_imports.modules import shared, errors, scripts
    from modules.common_imports.utils import os, sys, json, re

Import Statistics (from analysis of src/modules/):
- os: 67 files (44.4%)
- torch: 56 files (37.1%) 
- gradio: 39 files (25.8%)
- modules.shared: 19 files (12.6%)
- PIL.Image: 8 files (5.3%)
"""

# Standard Library Imports (High Frequency)
import os
import sys
import json
import re
import logging
import html
import importlib
import datetime
import inspect
import threading
import time
import math
import traceback
import hashlib
import dataclasses
import io
from pathlib import Path
from contextlib import closing
from collections import namedtuple, defaultdict
from functools import wraps
from urllib.parse import urlparse

# Core ML/AI Libraries
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    torch = None
    TORCH_AVAILABLE = False

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    np = None
    NUMPY_AVAILABLE = False

try:
    import gradio as gr
    GRADIO_AVAILABLE = True
except ImportError:
    gr = None
    GRADIO_AVAILABLE = False

# Image Processing
try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    Image = None
    PIL_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    cv2 = None
    CV2_AVAILABLE = False

# Additional ML Libraries (conditional imports)
try:
    import tqdm
    TQDM_AVAILABLE = True
except ImportError:
    tqdm = None
    TQDM_AVAILABLE = False

try:
    import k_diffusion
    K_DIFFUSION_AVAILABLE = True
except ImportError:
    k_diffusion = None
    K_DIFFUSION_AVAILABLE = False

try:
    import safetensors
    SAFETENSORS_AVAILABLE = True
except ImportError:
    safetensors = None
    SAFETENSORS_AVAILABLE = False

try:
    import pytorch_lightning
    PYTORCH_LIGHTNING_AVAILABLE = True
except ImportError:
    pytorch_lightning = None
    PYTORCH_LIGHTNING_AVAILABLE = False

# Forge WebUI Modules (conditional imports to avoid circular dependencies)
try:
    from modules import shared
    SHARED_AVAILABLE = True
except ImportError:
    shared = None
    SHARED_AVAILABLE = False

try:
    from modules import errors
    ERRORS_AVAILABLE = True
except ImportError:
    errors = None
    ERRORS_AVAILABLE = False

try:
    from modules import scripts
    SCRIPTS_AVAILABLE = True
except ImportError:
    scripts = None
    SCRIPTS_AVAILABLE = False

try:
    from modules.shared import opts
    OPTS_AVAILABLE = True
except ImportError:
    opts = None
    OPTS_AVAILABLE = False

try:
    from modules.shared_cmd_options import cmd_opts
    CMD_OPTS_AVAILABLE = True
except ImportError:
    cmd_opts = None
    CMD_OPTS_AVAILABLE = False

# Forge-specific modules
try:
    from modules_forge import main_entry
    MAIN_ENTRY_AVAILABLE = True
except ImportError:
    main_entry = None
    MAIN_ENTRY_AVAILABLE = False

try:
    from modules_forge import main_thread
    MAIN_THREAD_AVAILABLE = True
except ImportError:
    main_thread = None
    MAIN_THREAD_AVAILABLE = False

try:
    from modules_forge.utils import prepare_free_memory
    FORGE_UTILS_AVAILABLE = True
except ImportError:
    prepare_free_memory = None
    FORGE_UTILS_AVAILABLE = False

try:
    from backend import memory_management
    MEMORY_MANAGEMENT_AVAILABLE = True
except ImportError:
    memory_management = None
    MEMORY_MANAGEMENT_AVAILABLE = False

# UI Components
try:
    from modules.ui_components import ToolButton
    UI_COMPONENTS_AVAILABLE = True
except ImportError:
    ToolButton = None
    UI_COMPONENTS_AVAILABLE = False

try:
    from modules.ui_common import create_refresh_button
    UI_COMMON_AVAILABLE = True
except ImportError:
    create_refresh_button = None
    UI_COMMON_AVAILABLE = False

# Availability flags for conditional usage
AVAILABILITY_FLAGS = {
    'torch': TORCH_AVAILABLE,
    'numpy': NUMPY_AVAILABLE,
    'gradio': GRADIO_AVAILABLE,
    'pil': PIL_AVAILABLE,
    'cv2': CV2_AVAILABLE,
    'tqdm': TQDM_AVAILABLE,
    'k_diffusion': K_DIFFUSION_AVAILABLE,
    'safetensors': SAFETENSORS_AVAILABLE,
    'pytorch_lightning': PYTORCH_LIGHTNING_AVAILABLE,
    'shared': SHARED_AVAILABLE,
    'errors': ERRORS_AVAILABLE,
    'scripts': SCRIPTS_AVAILABLE,
    'opts': OPTS_AVAILABLE,
    'cmd_opts': CMD_OPTS_AVAILABLE,
    'main_entry': MAIN_ENTRY_AVAILABLE,
    'main_thread': MAIN_THREAD_AVAILABLE,
    'forge_utils': FORGE_UTILS_AVAILABLE,
    'memory_management': MEMORY_MANAGEMENT_AVAILABLE,
    'ui_components': UI_COMPONENTS_AVAILABLE,
    'ui_common': UI_COMMON_AVAILABLE,
}

def check_availability(module_name: str) -> bool:
    """Check if a module is available for import"""
    return AVAILABILITY_FLAGS.get(module_name, False)

def get_available_modules():
    """Get list of available modules"""
    return [name for name, available in AVAILABILITY_FLAGS.items() if available]

def get_unavailable_modules():
    """Get list of unavailable modules"""
    return [name for name, available in AVAILABILITY_FLAGS.items() if not available]

# Convenience imports for backward compatibility
# These maintain the original import patterns while using the consolidated module

# Core imports that are almost always available
__all__ = [
    # Standard library
    'os', 'sys', 'json', 're', 'logging', 'html', 'importlib', 
    'datetime', 'inspect', 'threading', 'time', 'math', 'traceback', 
    'hashlib', 'dataclasses', 'io', 'Path', 'closing', 'namedtuple', 
    'defaultdict', 'wraps', 'urlparse', 'annotations',
    
    # ML/AI libraries (conditional)
    'torch', 'np', 'gr', 'Image', 'cv2', 'tqdm', 'k_diffusion', 
    'safetensors', 'pytorch_lightning',
    
    # Forge modules (conditional)
    'shared', 'errors', 'scripts', 'opts', 'cmd_opts', 'main_entry', 
    'main_thread', 'prepare_free_memory', 'memory_management',
    'ToolButton', 'create_refresh_button',
    
    # Utility functions
    'check_availability', 'get_available_modules', 'get_unavailable_modules',
    'AVAILABILITY_FLAGS'
]

# Log successful initialization
if SHARED_AVAILABLE and hasattr(shared, 'opts'):
    # Only log if we're in a full WebUI context
    pass
else:
    # Minimal logging for development/testing contexts
    available_count = sum(AVAILABILITY_FLAGS.values())
    total_count = len(AVAILABILITY_FLAGS)
    print(f"Common imports initialized: {available_count}/{total_count} modules available")
