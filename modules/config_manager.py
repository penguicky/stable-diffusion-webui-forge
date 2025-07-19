"""
Centralized Configuration Management System for Forge WebUI

This module provides a unified interface for all configuration access patterns
across the codebase. It consolidates access to:
- modules.shared.opts (runtime options)
- modules.shared_cmd_options.cmd_opts (command line options)
- Configuration file operations
- Settings validation and type checking
- Configuration change callbacks

Usage Examples:
    from modules.config_manager import ConfigManager
    
    config = ConfigManager()
    
    # Get configuration values
    model_checkpoint = config.get('sd_model_checkpoint')
    batch_size = config.get_cmd_opt('batch_size', default=1)
    
    # Set configuration values
    config.set('cfg_scale', 7.5)
    
    # Safe configuration access
    if config.has_option('new_feature_enabled'):
        enabled = config.get('new_feature_enabled')
"""

from __future__ import annotations
from typing import Any, Optional, Dict, List, Callable, Union
import json
import os
from dataclasses import dataclass
from enum import Enum

from modules.common_imports import check_availability
from modules.error_handler import (
    safe_operation, ConfigurationError, ValidationError, 
    validate_input, error_handler
)

# Import configuration modules if available
if check_availability('shared'):
    from modules.common_imports.forge import shared, opts, cmd_opts
else:
    shared = None
    opts = None
    cmd_opts = None


class ConfigType(Enum):
    """Types of configuration sources"""
    RUNTIME_OPTION = "runtime_option"      # shared.opts
    COMMAND_LINE = "command_line"          # cmd_opts
    FILE_BASED = "file_based"              # JSON config files
    ENVIRONMENT = "environment"            # Environment variables


@dataclass
class ConfigValue:
    """Represents a configuration value with metadata"""
    key: str
    value: Any
    config_type: ConfigType
    default: Any = None
    description: str = ""
    requires_restart: bool = False
    validation_func: Optional[Callable] = None


class ConfigurationManager:
    """
    Centralized configuration management system.
    
    Provides unified access to all configuration sources in Forge WebUI:
    - Runtime options (shared.opts)
    - Command line options (cmd_opts)
    - Configuration files
    - Environment variables
    """
    
    _instance: Optional['ConfigurationManager'] = None
    _initialized: bool = False
    
    def __new__(cls) -> 'ConfigurationManager':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialize()
            ConfigurationManager._initialized = True
    
    @safe_operation("ConfigurationManager initialization", ConfigurationError)
    def _initialize(self):
        """Initialize the configuration manager"""
        self._config_cache: Dict[str, ConfigValue] = {}
        self._change_callbacks: Dict[str, List[Callable]] = {}
        self._validation_rules: Dict[str, Callable] = {}
        
        # Check availability of configuration systems
        self._opts_available = opts is not None
        self._cmd_opts_available = cmd_opts is not None
        self._shared_available = shared is not None
        
        if self._shared_available:
            self._config_filename = getattr(shared, 'config_filename', 'config.json')
        else:
            self._config_filename = 'config.json'
    
    # Runtime Options (shared.opts) Access
    @safe_operation("Getting runtime option", ConfigurationError)
    def get_option(self, key: str, default: Any = None) -> Any:
        """Get a runtime option from shared.opts"""
        if not self._opts_available:
            return default
        
        try:
            return getattr(opts, key, default)
        except AttributeError:
            return opts.data.get(key, default) if hasattr(opts, 'data') else default
    
    @safe_operation("Setting runtime option", ConfigurationError)
    def set_option(self, key: str, value: Any, save: bool = True) -> bool:
        """Set a runtime option in shared.opts"""
        if not self._opts_available:
            return False
        
        validate_input(key is not None and key != "", "Option key cannot be empty")
        
        try:
            if hasattr(opts, 'set'):
                return opts.set(key, value)
            else:
                setattr(opts, key, value)
                if save and hasattr(opts, 'save'):
                    opts.save(self._config_filename)
                return True
        except Exception as e:
            error_handler.handle_error(e, f"Setting option {key} to {value}", ConfigurationError)
            return False
    
    # Command Line Options Access
    @safe_operation("Getting command line option", ConfigurationError)
    def get_cmd_option(self, key: str, default: Any = None) -> Any:
        """Get a command line option from cmd_opts"""
        if not self._cmd_opts_available:
            return default
        
        return getattr(cmd_opts, key, default)
    
    def has_cmd_option(self, key: str) -> bool:
        """Check if a command line option exists"""
        if not self._cmd_opts_available:
            return False
        
        return hasattr(cmd_opts, key)
    
    # Unified Configuration Access
    def get(self, key: str, default: Any = None, config_type: Optional[ConfigType] = None) -> Any:
        """
        Get a configuration value from any source.
        
        Args:
            key: Configuration key
            default: Default value if not found
            config_type: Specific configuration type to check, or None for auto-detection
        """
        # Check cache first
        if key in self._config_cache:
            return self._config_cache[key].value
        
        # Try different sources based on config_type or auto-detect
        if config_type == ConfigType.COMMAND_LINE or config_type is None:
            cmd_value = self.get_cmd_option(key)
            if cmd_value is not None:
                self._cache_value(key, cmd_value, ConfigType.COMMAND_LINE, default)
                return cmd_value
        
        if config_type == ConfigType.RUNTIME_OPTION or config_type is None:
            opt_value = self.get_option(key)
            if opt_value is not None:
                self._cache_value(key, opt_value, ConfigType.RUNTIME_OPTION, default)
                return opt_value
        
        if config_type == ConfigType.ENVIRONMENT or config_type is None:
            env_value = os.environ.get(key.upper())
            if env_value is not None:
                self._cache_value(key, env_value, ConfigType.ENVIRONMENT, default)
                return env_value
        
        return default
    
    def set(self, key: str, value: Any, config_type: ConfigType = ConfigType.RUNTIME_OPTION, 
            save: bool = True) -> bool:
        """
        Set a configuration value.
        
        Args:
            key: Configuration key
            value: Value to set
            config_type: Type of configuration to set
            save: Whether to save changes to disk
        """
        validate_input(key is not None and key != "", "Configuration key cannot be empty")
        
        # Validate value if validation rule exists
        if key in self._validation_rules:
            try:
                self._validation_rules[key](value)
            except Exception as e:
                raise ValidationError(f"Validation failed for {key}: {e}")
        
        success = False
        
        if config_type == ConfigType.RUNTIME_OPTION:
            success = self.set_option(key, value, save)
        elif config_type == ConfigType.ENVIRONMENT:
            os.environ[key.upper()] = str(value)
            success = True
        
        if success:
            # Update cache
            self._cache_value(key, value, config_type)
            
            # Call change callbacks
            self._call_change_callbacks(key, value)
        
        return success
    
    # Configuration Validation and Metadata
    def add_validation_rule(self, key: str, validation_func: Callable[[Any], bool]):
        """Add a validation rule for a configuration key"""
        validate_input(callable(validation_func), "Validation function must be callable")
        self._validation_rules[key] = validation_func
    
    def add_change_callback(self, key: str, callback: Callable[[str, Any], None]):
        """Add a callback for when a configuration value changes"""
        validate_input(callable(callback), "Callback must be callable")
        
        if key not in self._change_callbacks:
            self._change_callbacks[key] = []
        self._change_callbacks[key].append(callback)
    
    def has_option(self, key: str) -> bool:
        """Check if a configuration option exists in any source"""
        return (self.get_option(key) is not None or 
                self.get_cmd_option(key) is not None or
                os.environ.get(key.upper()) is not None)
    
    # Configuration File Operations
    @safe_operation("Loading configuration file", ConfigurationError)
    def load_config_file(self, filename: Optional[str] = None) -> Dict[str, Any]:
        """Load configuration from a JSON file"""
        config_file = filename or self._config_filename
        
        try:
            with open(config_file, 'r', encoding='utf8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
        except json.JSONDecodeError as e:
            raise ConfigurationError(f"Invalid JSON in config file {config_file}: {e}")
    
    @safe_operation("Saving configuration file", ConfigurationError)
    def save_config_file(self, config_data: Dict[str, Any], filename: Optional[str] = None):
        """Save configuration to a JSON file"""
        config_file = filename or self._config_filename
        
        validate_input(isinstance(config_data, dict), "Config data must be a dictionary")
        
        with open(config_file, 'w', encoding='utf8') as f:
            json.dump(config_data, f, indent=4, ensure_ascii=False)
    
    # Utility Methods
    def _cache_value(self, key: str, value: Any, config_type: ConfigType, default: Any = None):
        """Cache a configuration value"""
        self._config_cache[key] = ConfigValue(
            key=key,
            value=value,
            config_type=config_type,
            default=default
        )
    
    def _call_change_callbacks(self, key: str, value: Any):
        """Call registered change callbacks for a key"""
        if key in self._change_callbacks:
            for callback in self._change_callbacks[key]:
                try:
                    callback(key, value)
                except Exception as e:
                    error_handler.handle_error(
                        e, f"Configuration change callback for {key}", 
                        reraise=False
                    )
    
    def clear_cache(self):
        """Clear the configuration cache"""
        self._config_cache.clear()
    
    def get_cache_info(self) -> Dict[str, ConfigValue]:
        """Get information about cached configuration values"""
        return self._config_cache.copy()
    
    # Convenience Methods for Common Patterns
    def get_model_checkpoint(self) -> Optional[str]:
        """Get the current model checkpoint"""
        return self.get('sd_model_checkpoint')
    
    def get_batch_size(self) -> int:
        """Get the batch size"""
        return self.get('batch_size', default=1)
    
    def get_cfg_scale(self) -> float:
        """Get the CFG scale"""
        return self.get('cfg_scale', default=7.0)
    
    def get_steps(self) -> int:
        """Get the number of steps"""
        return self.get('steps', default=20)
    
    def is_api_enabled(self) -> bool:
        """Check if API is enabled"""
        return self.get_cmd_option('api', default=False)
    
    def get_output_dir(self) -> str:
        """Get the output directory"""
        return self.get('outdir_samples', default='outputs')
    
    # System Configuration Helpers
    def get_device_settings(self) -> Dict[str, Any]:
        """Get device-related configuration settings"""
        return {
            'device': self.get_cmd_option('device'),
            'precision': self.get_cmd_option('precision', 'autocast'),
            'no_half': self.get_cmd_option('no_half', False),
            'no_half_vae': self.get_cmd_option('no_half_vae', False),
            'use_cpu': self.get_cmd_option('use_cpu', []),
        }
    
    def get_memory_settings(self) -> Dict[str, Any]:
        """Get memory-related configuration settings"""
        return {
            'lowvram': self.get_cmd_option('lowvram', False),
            'medvram': self.get_cmd_option('medvram', False),
            'always_batch_cond_uncond': self.get('always_batch_cond_uncond', True),
            'forge_inference_memory': self.get('forge_inference_memory', 1024),
            'forge_async_loading': self.get('forge_async_loading', 'Queue'),
        }


# Global instance for easy access
config_manager = ConfigurationManager()

# Convenience functions for backward compatibility
def get_config(key: str, default: Any = None) -> Any:
    """Get a configuration value (convenience function)"""
    return config_manager.get(key, default)

def set_config(key: str, value: Any, save: bool = True) -> bool:
    """Set a configuration value (convenience function)"""
    return config_manager.set(key, value, save=save)

def has_config(key: str) -> bool:
    """Check if a configuration option exists (convenience function)"""
    return config_manager.has_option(key)

# Export commonly used classes and functions
__all__ = [
    # Main classes
    'ConfigurationManager', 'ConfigValue', 'ConfigType',
    
    # Global instance
    'config_manager',
    
    # Convenience functions
    'get_config', 'set_config', 'has_config'
]
