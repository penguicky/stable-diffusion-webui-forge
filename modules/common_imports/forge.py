"""
Forge WebUI Module Imports

This module provides commonly used Forge WebUI internal module imports
with proper handling of circular dependencies and import availability.
"""

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

try:
    from modules.infotext_utils import PasteField
    INFOTEXT_UTILS_AVAILABLE = True
except ImportError:
    PasteField = None
    INFOTEXT_UTILS_AVAILABLE = False

try:
    from modules.call_queue import wrap_gradio_gpu_call, wrap_queued_call
    CALL_QUEUE_AVAILABLE = True
except ImportError:
    wrap_gradio_gpu_call = None
    wrap_queued_call = None
    CALL_QUEUE_AVAILABLE = False

try:
    from modules.timer import startup_timer
    TIMER_AVAILABLE = True
except ImportError:
    startup_timer = None
    TIMER_AVAILABLE = False

# Availability tracking
FORGE_AVAILABILITY = {
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
    'infotext_utils': INFOTEXT_UTILS_AVAILABLE,
    'call_queue': CALL_QUEUE_AVAILABLE,
    'timer': TIMER_AVAILABLE,
}

def get_available_forge_modules():
    """Get list of available Forge modules"""
    return [name for name, available in FORGE_AVAILABILITY.items() if available]

__all__ = [
    # Core modules
    'shared', 'errors', 'scripts', 'opts', 'cmd_opts',
    
    # Forge-specific
    'main_entry', 'main_thread', 'prepare_free_memory', 'memory_management',
    
    # UI components
    'ToolButton', 'create_refresh_button', 'PasteField',
    
    # Utilities
    'wrap_gradio_gpu_call', 'wrap_queued_call', 'startup_timer',
    
    # Availability tracking
    'FORGE_AVAILABILITY', 'get_available_forge_modules'
]
