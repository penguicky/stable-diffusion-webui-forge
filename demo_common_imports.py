#!/usr/bin/env python3
"""
Demonstration of the Common Imports System

This script shows how to use the new common_imports module and its benefits.
"""

def demo_basic_usage():
    """Demonstrate basic usage patterns"""
    print("🔹 BASIC USAGE PATTERNS")
    print("-" * 40)
    
    # Method 1: Import specific modules from categories
    print("Method 1: Category-specific imports")
    try:
        from modules.common_imports.stdlib import os, sys, json
        from modules.common_imports.core import torch, np, gr
        print("✓ Successfully imported from categories")
        print(f"  - os.name: {os.name}")
        print(f"  - sys.version_info: {sys.version_info[:2]}")
        print(f"  - torch available: {torch is not None}")
    except Exception as e:
        print(f"✗ Category import failed: {e}")
    
    # Method 2: Import from main module
    print("\nMethod 2: Main module imports")
    try:
        from modules.common_imports import os, sys, json, check_availability
        print("✓ Successfully imported from main module")
        print(f"  - torch available: {check_availability('torch')}")
        print(f"  - gradio available: {check_availability('gradio')}")
    except Exception as e:
        print(f"✗ Main module import failed: {e}")

def demo_availability_checking():
    """Demonstrate availability checking features"""
    print("\n🔹 AVAILABILITY CHECKING")
    print("-" * 40)
    
    try:
        from modules.common_imports import (
            check_availability, get_available_modules, 
            get_unavailable_modules, print_availability_report
        )
        
        # Check specific modules
        modules_to_check = ['torch', 'gradio', 'numpy', 'shared', 'errors']
        for module in modules_to_check:
            status = "✓" if check_availability(module) else "✗"
            print(f"  {status} {module}")
        
        # Print full report
        print("\nFull availability report:")
        print_availability_report()
        
    except Exception as e:
        print(f"✗ Availability checking failed: {e}")

def demo_conditional_usage():
    """Demonstrate conditional usage based on availability"""
    print("\n🔹 CONDITIONAL USAGE PATTERNS")
    print("-" * 40)
    
    try:
        from modules.common_imports import check_availability
        
        # Conditional torch usage
        if check_availability('torch'):
            from modules.common_imports.core import torch
            print("✓ Using torch functionality")
            print(f"  - torch.cuda.is_available(): {torch.cuda.is_available() if torch else 'N/A'}")
        else:
            print("✗ Torch not available, using fallback")
        
        # Conditional gradio usage
        if check_availability('gradio'):
            from modules.common_imports.core import gr
            print("✓ Gradio available for UI components")
        else:
            print("✗ Gradio not available, UI components disabled")
        
        # Conditional Forge modules
        if check_availability('shared'):
            from modules.common_imports.forge import shared
            print("✓ Forge shared module available")
        else:
            print("✗ Forge shared module not available")
            
    except Exception as e:
        print(f"✗ Conditional usage demo failed: {e}")

def demo_migration_example():
    """Show before/after migration example"""
    print("\n🔹 MIGRATION EXAMPLE")
    print("-" * 40)
    
    print("BEFORE (old pattern):")
    print("""
    import os
    import sys
    import torch
    import gradio as gr
    import numpy as np
    from modules import shared, errors
    from modules.shared import opts
    from PIL import Image
    """)
    
    print("AFTER (using common_imports):")
    print("""
    from modules.common_imports import (
        os, sys, torch, gr, np, shared, errors, opts, Image
    )
    """)
    
    print("BENEFITS:")
    print("  ✓ Reduced import redundancy")
    print("  ✓ Centralized dependency management")
    print("  ✓ Automatic availability checking")
    print("  ✓ Easier maintenance and updates")

def demo_performance_comparison():
    """Demonstrate performance characteristics"""
    print("\n🔹 PERFORMANCE CHARACTERISTICS")
    print("-" * 40)
    
    import time
    
    # Time the import process
    start_time = time.time()
    try:
        from modules.common_imports import os, sys, json, re, logging
        import_time = time.time() - start_time
        print(f"✓ Common imports loaded in {import_time:.4f} seconds")
    except Exception as e:
        print(f"✗ Import timing failed: {e}")
    
    # Show memory efficiency
    try:
        from modules.common_imports import get_available_modules
        available_count = len(get_available_modules())
        print(f"✓ {available_count} modules available through single import")
    except Exception as e:
        print(f"✗ Memory efficiency demo failed: {e}")

def main():
    """Run all demonstrations"""
    print("=" * 60)
    print("COMMON IMPORTS SYSTEM DEMONSTRATION")
    print("=" * 60)
    
    demo_basic_usage()
    demo_availability_checking()
    demo_conditional_usage()
    demo_migration_example()
    demo_performance_comparison()
    
    print("\n" + "=" * 60)
    print("🎉 DEMONSTRATION COMPLETE")
    print("=" * 60)
    print("The common_imports system provides:")
    print("  ✓ Reduced import redundancy (35+ common imports consolidated)")
    print("  ✓ Automatic availability checking")
    print("  ✓ Organized import categories (core, stdlib, forge)")
    print("  ✓ Backward compatibility with existing code")
    print("  ✓ Easy migration path for new and existing modules")
    print("  ✓ Better dependency management")
    print("\nReady for integration into the Forge WebUI codebase!")

if __name__ == "__main__":
    main()
