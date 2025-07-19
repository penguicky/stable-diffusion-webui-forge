"""
Legacy device management module - DEPRECATED

This module has been replaced by the unified DeviceManager in device_manager.py.
It now imports and re-exports the new functionality for backward compatibility.

All new code should use the DeviceManager class directly:
    from modules.device_manager import DeviceManager
    device_manager = DeviceManager()
"""

# Import all functionality from the new unified device manager
from modules.device_manager import (
    # Main classes
    DeviceManager, DeviceError, DeviceType,

    # Legacy compatibility functions
    has_xpu, has_mps, cuda_no_autocast, get_cuda_device_id,
    get_cuda_device_string, get_optimal_device_name, get_optimal_device,
    get_device_for, torch_gc, torch_npu_set_device, enable_tf32,

    # Legacy compatibility constants
    cpu, device, fp8, device_interrogate, device_gfpgan, device_esrgan,
    device_codeformer, dtype, dtype_vae, dtype_unet, dtype_inference,
    unet_needs_upcast,

    # Legacy compatibility functions
    cond_cast_unet, cond_cast_float, manual_cast_forward, manual_cast,
    autocast, without_autocast, test_for_nans, first_time_calculation,

    # Legacy compatibility variables
    nv_rng, patch_module_list,

    # Legacy exception
    NansException
)

# Provide access to the global device manager instance
device_manager = DeviceManager()
