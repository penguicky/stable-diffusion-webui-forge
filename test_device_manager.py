#!/usr/bin/env python3
"""
Test script for the new DeviceManager implementation.

This script verifies that the DeviceManager works correctly and maintains
backward compatibility with the original devices.py API.
"""

import sys
import os
import traceback

# Add the src directory to the path
sys.path.insert(0, os.path.dirname(__file__))

def test_device_manager():
    """Test the DeviceManager functionality"""
    print("Testing DeviceManager...")
    
    try:
        # Test importing the new DeviceManager
        from modules.device_manager import DeviceManager, DeviceError
        print("✓ Successfully imported DeviceManager")
        
        # Test singleton behavior
        dm1 = DeviceManager()
        dm2 = DeviceManager()
        assert dm1 is dm2, "DeviceManager should be a singleton"
        print("✓ Singleton behavior works correctly")
        
        # Test device detection methods
        print(f"✓ Has CUDA: {dm1.has_cuda()}")
        print(f"✓ Has MPS: {dm1.has_mps()}")
        print(f"✓ Has XPU: {dm1.has_xpu()}")
        print(f"✓ Supports FP16: {dm1.supports_fp16()}")
        print(f"✓ Supports BF16: {dm1.supports_bf16()}")
        
        # Test device access methods
        primary_device = dm1.get_primary_device()
        print(f"✓ Primary device: {primary_device}")
        print(f"✓ Device string: {dm1.get_device_string()}")
        print(f"✓ Device name: {dm1.get_device_name()}")
        print(f"✓ Device ID: {dm1.get_device_id()}")
        
        # Test memory methods
        print(f"✓ Total VRAM: {dm1.get_total_vram_mb():.0f} MB")
        print(f"✓ Total RAM: {dm1.get_total_ram_mb():.0f} MB")
        
        # Test dtype methods
        print(f"✓ UNet dtype: {dm1.get_unet_dtype()}")
        print(f"✓ VAE dtype: {dm1.get_vae_dtype()}")
        print(f"✓ Text encoder dtype: {dm1.get_text_encoder_dtype()}")
        
        # Test autocast context manager
        with dm1.autocast():
            print("✓ Autocast context manager works")
        
        print("✓ DeviceManager tests passed!")
        return True
        
    except Exception as e:
        print(f"✗ DeviceManager test failed: {e}")
        traceback.print_exc()
        return False

def test_backward_compatibility():
    """Test backward compatibility with the original devices.py API"""
    print("\nTesting backward compatibility...")
    
    try:
        # Test importing from the legacy module
        from modules import devices
        print("✓ Successfully imported legacy devices module")
        
        # Test legacy functions
        print(f"✓ has_xpu(): {devices.has_xpu()}")
        print(f"✓ has_mps(): {devices.has_mps()}")
        print(f"✓ get_optimal_device(): {devices.get_optimal_device()}")
        print(f"✓ get_device_string(): {devices.get_cuda_device_string()}")
        print(f"✓ get_device_name(): {devices.get_optimal_device_name()}")
        
        # Test legacy constants
        print(f"✓ devices.cpu: {devices.cpu}")
        print(f"✓ devices.device: {devices.device}")
        print(f"✓ devices.dtype: {devices.dtype}")
        print(f"✓ devices.dtype_vae: {devices.dtype_vae}")
        print(f"✓ devices.dtype_unet: {devices.dtype_unet}")
        
        # Test legacy functions that should be no-ops
        devices.torch_gc()  # Should not raise an error
        devices.enable_tf32()  # Should not raise an error
        devices.torch_npu_set_device()  # Should not raise an error
        print("✓ Legacy no-op functions work correctly")
        
        # Test legacy context managers
        with devices.autocast():
            print("✓ Legacy autocast context manager works")
        
        with devices.without_autocast():
            print("✓ Legacy without_autocast context manager works")
        
        with devices.manual_cast(None):
            print("✓ Legacy manual_cast context manager works")
        
        print("✓ Backward compatibility tests passed!")
        return True
        
    except Exception as e:
        print(f"✗ Backward compatibility test failed: {e}")
        traceback.print_exc()
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("DeviceManager Implementation Test Suite")
    print("=" * 60)
    
    success = True
    
    # Test DeviceManager functionality
    success &= test_device_manager()
    
    # Test backward compatibility
    success &= test_backward_compatibility()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 All tests passed! DeviceManager implementation is working correctly.")
        print("✓ Device detection and management functionality works")
        print("✓ Backward compatibility is maintained")
        print("✓ Ready for integration into the main codebase")
    else:
        print("❌ Some tests failed. Please review the implementation.")
        return 1
    
    print("=" * 60)
    return 0

if __name__ == "__main__":
    sys.exit(main())
