"""
Core ML/AI Library Imports

This module provides the core machine learning and AI libraries
that are frequently used across the Forge WebUI codebase.
"""

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

# Additional ML Libraries
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

# Availability tracking
CORE_AVAILABILITY = {
    'torch': TORCH_AVAILABLE,
    'numpy': NUMPY_AVAILABLE,
    'gradio': GRADIO_AVAILABLE,
    'pil': PIL_AVAILABLE,
    'cv2': CV2_AVAILABLE,
    'tqdm': TQDM_AVAILABLE,
    'k_diffusion': K_DIFFUSION_AVAILABLE,
    'safetensors': SAFETENSORS_AVAILABLE,
    'pytorch_lightning': PYTORCH_LIGHTNING_AVAILABLE,
}

__all__ = [
    'torch', 'np', 'gr', 'Image', 'cv2', 'tqdm', 'k_diffusion', 
    'safetensors', 'pytorch_lightning', 'CORE_AVAILABILITY'
]
