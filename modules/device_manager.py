"""
Unified Device Management System for Forge WebUI

This module consolidates all device detection, management, and memory handling
functionality that was previously scattered across modules/devices.py and
backend/memory_management.py.

The DeviceManager class provides a singleton interface for:
- Device detection and selection
- Memory management and monitoring
- Data type optimization
- Cache management
- Error handling for device operations
"""

import contextlib
import logging
import torch
from typing import Optional, Union, List, Tuple, Dict, Any
from enum import Enum

from backend import memory_management
from modules.error_handler import DeviceError, safe_operation, error_handler


class DeviceType(Enum):
    """Enumeration of supported device types"""
    CPU = "cpu"
    CUDA = "cuda"
    MPS = "mps"
    XPU = "xpu"
    DIRECTML = "directml"


class DeviceManager:
    """
    Singleton class for unified device management.
    
    Consolidates device detection, memory management, and optimization
    functionality from the original scattered implementation.
    """
    
    _instance: Optional['DeviceManager'] = None
    _initialized: bool = False
    
    def __new__(cls) -> 'DeviceManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize()
            DeviceManager._initialized = True
    
    @safe_operation("DeviceManager initialization", DeviceError)
    def _initialize(self):
        """Initialize device manager with current system configuration"""
        self._logger = logging.getLogger(__name__)

        # Cache device information
        self._primary_device = memory_management.get_torch_device()
        self._cpu_device = torch.device("cpu")

        # Cache device capabilities
        self._device_capabilities = self._detect_capabilities()

        # Cache memory information
        self._total_vram = memory_management.total_vram
        self._total_ram = memory_management.total_ram

        # Cache dtype preferences
        self._dtype_preferences = self._initialize_dtype_preferences()

        self._logger.info(f"DeviceManager initialized with primary device: {self._primary_device}")
    
    def _detect_capabilities(self) -> Dict[str, bool]:
        """Detect and cache device capabilities"""
        capabilities = {
            'has_cuda': torch.cuda.is_available(),
            'has_mps': memory_management.mps_mode(),
            'has_xpu': memory_management.xpu_available,
            'has_directml': memory_management.directml_enabled,
            'supports_fp16': False,
            'supports_bf16': False,
            'supports_xformers': memory_management.XFORMERS_IS_AVAILABLE,
        }
        
        # Detect precision support
        try:
            if capabilities['has_cuda']:
                capabilities['supports_fp16'] = True
                if torch.cuda.is_bf16_supported():
                    capabilities['supports_bf16'] = True
            elif capabilities['has_xpu']:
                capabilities['supports_fp16'] = True
                capabilities['supports_bf16'] = True
        except Exception as e:
            self._logger.warning(f"Could not detect precision capabilities: {e}")
        
        return capabilities
    
    def _initialize_dtype_preferences(self) -> Dict[str, torch.dtype]:
        """Initialize data type preferences for different components"""
        return {
            'unet': memory_management.unet_dtype(),
            'vae': memory_management.vae_dtype(),
            'text_encoder': torch.float16 if self.supports_fp16() else torch.float32,
            'default': torch.float16 if self.supports_fp16() else torch.float32,
        }
    
    # Device Detection Methods
    def has_cuda(self) -> bool:
        """Check if CUDA is available"""
        return self._device_capabilities['has_cuda']
    
    def has_mps(self) -> bool:
        """Check if MPS (Apple Metal) is available"""
        return self._device_capabilities['has_mps']
    
    def has_xpu(self) -> bool:
        """Check if Intel XPU is available"""
        return self._device_capabilities['has_xpu']
    
    def has_directml(self) -> bool:
        """Check if DirectML is available"""
        return self._device_capabilities['has_directml']
    
    def supports_fp16(self) -> bool:
        """Check if the device supports FP16 precision"""
        return self._device_capabilities['supports_fp16']
    
    def supports_bf16(self) -> bool:
        """Check if the device supports BF16 precision"""
        return self._device_capabilities['supports_bf16']
    
    def supports_xformers(self) -> bool:
        """Check if xformers is available"""
        return self._device_capabilities['supports_xformers']
    
    # Device Access Methods
    def get_primary_device(self) -> torch.device:
        """Get the primary compute device"""
        return self._primary_device
    
    def get_cpu_device(self) -> torch.device:
        """Get the CPU device"""
        return self._cpu_device
    
    def get_optimal_device(self) -> torch.device:
        """Get the optimal device for computation (alias for primary device)"""
        return self._primary_device
    
    def get_device_for_task(self, task: str = "default") -> torch.device:
        """Get the appropriate device for a specific task"""
        # For now, return primary device for all tasks
        # This can be extended to support task-specific device selection
        return self._primary_device
    
    def get_device_string(self) -> str:
        """Get string representation of the primary device"""
        return str(self._primary_device)
    
    def get_device_name(self) -> str:
        """Get the type name of the primary device"""
        return self._primary_device.type
    
    def get_device_id(self) -> Optional[int]:
        """Get the device ID (for CUDA devices)"""
        if hasattr(self._primary_device, 'index'):
            return self._primary_device.index
        return None
    
    # Memory Management Methods
    def get_total_vram_mb(self) -> float:
        """Get total VRAM in MB"""
        return self._total_vram
    
    def get_total_ram_mb(self) -> float:
        """Get total system RAM in MB"""
        return self._total_ram
    
    @safe_operation("Getting free memory", DeviceError)
    def get_free_memory(self, device: Optional[torch.device] = None) -> int:
        """Get free memory for the specified device"""
        if device is None:
            device = self._primary_device
        return memory_management.get_free_memory(device)

    @safe_operation("Garbage collection", DeviceError)
    def torch_gc(self):
        """Perform garbage collection and cache cleanup"""
        memory_management.soft_empty_cache()

    @safe_operation("Emptying cache", DeviceError)
    def empty_cache(self, force: bool = False):
        """Empty device cache"""
        memory_management.soft_empty_cache(force=force)
    
    # Data Type Methods
    def get_optimal_dtype(self, component: str = "default") -> torch.dtype:
        """Get optimal data type for a component"""
        return self._dtype_preferences.get(component, self._dtype_preferences['default'])
    
    def get_unet_dtype(self) -> torch.dtype:
        """Get optimal dtype for UNet"""
        return self._dtype_preferences['unet']
    
    def get_vae_dtype(self) -> torch.dtype:
        """Get optimal dtype for VAE"""
        return self._dtype_preferences['vae']
    
    def get_text_encoder_dtype(self) -> torch.dtype:
        """Get optimal dtype for text encoder"""
        return self._dtype_preferences['text_encoder']
    
    # Utility Methods
    @contextlib.contextmanager
    def autocast(self, enabled: bool = True):
        """Context manager for automatic mixed precision"""
        if enabled and self.supports_fp16():
            device_type = self.get_device_name()
            if device_type in ['cuda', 'cpu']:
                with torch.autocast(device_type=device_type):
                    yield
            else:
                yield
        else:
            yield
    
    def cuda_no_autocast(self, device_id: Optional[int] = None) -> bool:
        """Check if CUDA autocast should be disabled (legacy compatibility)"""
        return False
    
    def enable_tf32(self):
        """Enable TF32 (legacy compatibility - no-op in current implementation)"""
        pass
    
    def torch_npu_set_device(self):
        """Set NPU device (legacy compatibility - no-op)"""
        pass
    
    # Error Handling
    def safe_operation(self, operation, *args, **kwargs):
        """Execute an operation with proper error handling"""
        return error_handler.safe_execute(
            operation, *args,
            context=f"Device operation: {operation.__name__}",
            error_type=DeviceError,
            **kwargs
        )


# Global instance for backward compatibility
device_manager = DeviceManager()

# Legacy compatibility functions - these maintain the original API
def has_xpu() -> bool:
    return device_manager.has_xpu()

def has_mps() -> bool:
    return device_manager.has_mps()

def cuda_no_autocast(device_id=None) -> bool:
    return device_manager.cuda_no_autocast(device_id)

def get_cuda_device_id():
    return device_manager.get_device_id()

def get_cuda_device_string():
    return device_manager.get_device_string()

def get_optimal_device_name():
    return device_manager.get_device_name()

def get_optimal_device():
    return device_manager.get_optimal_device()

def get_device_for(task):
    return device_manager.get_device_for_task(task)

def torch_gc():
    device_manager.torch_gc()

def torch_npu_set_device():
    device_manager.torch_npu_set_device()

def enable_tf32():
    device_manager.enable_tf32()

# Legacy compatibility constants and variables
cpu = device_manager.get_cpu_device()
device = device_manager.get_primary_device()
fp8 = False  # Legacy compatibility

# Device assignments for different components (backward compatibility)
device_interrogate = memory_management.text_encoder_device()
device_gfpgan = device_manager.get_primary_device()
device_esrgan = device_manager.get_primary_device()
device_codeformer = device_manager.get_primary_device()

# Data type assignments (backward compatibility)
dtype = device_manager.get_optimal_dtype('default')
dtype_vae = device_manager.get_vae_dtype()
dtype_unet = device_manager.get_unet_dtype()
dtype_inference = device_manager.get_unet_dtype()
unet_needs_upcast = False

# Legacy casting functions (no-op in current implementation)
def cond_cast_unet(input):
    return input

def cond_cast_float(input):
    return input

# Legacy variables
nv_rng = None
patch_module_list = []

# Legacy casting context managers
def manual_cast_forward(target_dtype):
    return

@contextlib.contextmanager
def manual_cast(target_dtype):
    yield

def autocast(disable=False):
    if disable:
        return contextlib.nullcontext()
    return device_manager.autocast()

def without_autocast(disable=False):
    return contextlib.nullcontext()

# Legacy exception class
class NansException(Exception):
    pass

# Legacy utility functions
def test_for_nans(x, where):
    return

def first_time_calculation():
    return
