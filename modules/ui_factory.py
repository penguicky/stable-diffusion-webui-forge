"""
UI Component Factory for Forge WebUI

This module provides factory classes and methods to reduce repetitive Gradio
component creation patterns across scripts. Based on analysis of UI patterns
in scripts and extensions, this factory consolidates common component types
and configurations.

Usage Examples:
    from modules.ui_factory import UIFactory, SliderFactory, CheckboxFactory
    
    # Create common sliders
    slider = SliderFactory.create_percentage_slider("Strength", default=0.75)
    
    # Create component groups
    freeu_controls = UIFactory.create_freeu_controls()
    
    # Create axis controls for XYZ grid
    axis_controls = UIFactory.create_axis_controls("X", axis_options)
"""

from __future__ import annotations
from typing import Dict, List, Optional, Any, Tuple, Union, Callable
from dataclasses import dataclass

from modules.common_imports import gr
from modules.common_imports import check_availability
from modules.error_handler import safe_operation, ValidationError, validate_input

# Import UI components if available
if check_availability('ui_components'):
    from modules.common_imports.forge import ToolButton
else:
    ToolButton = None


@dataclass
class ComponentConfig:
    """Configuration for UI components"""
    label: str
    value: Any = None
    minimum: Optional[float] = None
    maximum: Optional[float] = None
    step: Optional[float] = None
    choices: Optional[List[str]] = None
    elem_id: Optional[str] = None
    elem_classes: Optional[List[str]] = None
    visible: bool = True
    interactive: bool = True
    scale: Optional[int] = None
    tooltip: Optional[str] = None


class SliderFactory:
    """Factory for creating common slider patterns"""
    
    @staticmethod
    @safe_operation("Creating slider", ValidationError)
    def create_slider(label: str, minimum: float = 0.0, maximum: float = 1.0, 
                     step: float = 0.01, value: float = 0.5, **kwargs) -> 'gr.Slider':
        """Create a basic slider with common defaults"""
        validate_input(minimum < maximum, "Minimum must be less than maximum")
        validate_input(minimum <= value <= maximum, "Value must be between minimum and maximum")
        
        return gr.Slider(
            label=label,
            minimum=minimum,
            maximum=maximum,
            step=step,
            value=value,
            **kwargs
        )
    
    @staticmethod
    def create_percentage_slider(label: str, value: float = 0.5, **kwargs) -> 'gr.Slider':
        """Create a percentage slider (0-1)"""
        return SliderFactory.create_slider(
            label=label, minimum=0.0, maximum=1.0, step=0.01, value=value, **kwargs
        )
    
    @staticmethod
    def create_scale_slider(label: str, value: float = 1.0, maximum: float = 2.0, **kwargs) -> 'gr.Slider':
        """Create a scale slider (0-2) common in many extensions"""
        return SliderFactory.create_slider(
            label=label, minimum=0.0, maximum=maximum, step=0.01, value=value, **kwargs
        )
    
    @staticmethod
    def create_step_slider(label: str, value: float = 0.0, **kwargs) -> 'gr.Slider':
        """Create a step slider (0-1) for start/end steps"""
        return SliderFactory.create_slider(
            label=label, minimum=0.0, maximum=1.0, step=0.01, value=value, **kwargs
        )
    
    @staticmethod
    def create_margin_slider(label: str = "Margin (px)", value: int = 0, maximum: int = 500, **kwargs) -> 'gr.Slider':
        """Create a margin slider for spacing controls"""
        return SliderFactory.create_slider(
            label=label, minimum=0, maximum=maximum, step=2, value=value, **kwargs
        )


class CheckboxFactory:
    """Factory for creating common checkbox patterns"""
    
    @staticmethod
    @safe_operation("Creating checkbox", ValidationError)
    def create_checkbox(label: str, value: bool = False, **kwargs) -> 'gr.Checkbox':
        """Create a basic checkbox"""
        return gr.Checkbox(label=label, value=value, **kwargs)
    
    @staticmethod
    def create_enabled_checkbox(label: str = "Enabled", **kwargs) -> 'gr.Checkbox':
        """Create an 'Enabled' checkbox (common pattern)"""
        return CheckboxFactory.create_checkbox(label=label, value=False, **kwargs)
    
    @staticmethod
    def create_toggle_checkbox(label: str, default: bool = True, **kwargs) -> 'gr.Checkbox':
        """Create a toggle checkbox with custom default"""
        return CheckboxFactory.create_checkbox(label=label, value=default, **kwargs)


class DropdownFactory:
    """Factory for creating common dropdown patterns"""
    
    @staticmethod
    @safe_operation("Creating dropdown", ValidationError)
    def create_dropdown(label: str, choices: List[str], value: Optional[str] = None, **kwargs) -> 'gr.Dropdown':
        """Create a basic dropdown"""
        validate_input(len(choices) > 0, "Choices list cannot be empty")
        
        if value is None and choices:
            value = choices[0]
        
        return gr.Dropdown(label=label, choices=choices, value=value, **kwargs)
    
    @staticmethod
    def create_type_dropdown(label: str, options: List[Any], **kwargs) -> 'gr.Dropdown':
        """Create a type dropdown (common in XYZ grid)"""
        choices = [opt.label if hasattr(opt, 'label') else str(opt) for opt in options]
        return DropdownFactory.create_dropdown(
            label=label, choices=choices, type="index", **kwargs
        )
    
    @staticmethod
    def create_preset_dropdown(label: str, presets: List[Tuple], **kwargs) -> 'gr.Dropdown':
        """Create a preset dropdown"""
        choices = [preset[0] for preset in presets]
        return DropdownFactory.create_dropdown(
            label=label, choices=choices, value="(presets)", 
            type="index", allow_custom_value=True, **kwargs
        )


class TextboxFactory:
    """Factory for creating common textbox patterns"""
    
    @staticmethod
    @safe_operation("Creating textbox", ValidationError)
    def create_textbox(label: str, value: str = "", lines: int = 1, **kwargs) -> 'gr.Textbox':
        """Create a basic textbox"""
        return gr.Textbox(label=label, value=value, lines=lines, **kwargs)
    
    @staticmethod
    def create_values_textbox(label: str, **kwargs) -> 'gr.Textbox':
        """Create a values textbox (common in XYZ grid)"""
        return TextboxFactory.create_textbox(label=label, lines=1, **kwargs)


class ButtonFactory:
    """Factory for creating common button patterns"""
    
    @staticmethod
    @safe_operation("Creating button", ValidationError)
    def create_button(value: str, **kwargs) -> 'gr.Button':
        """Create a basic button"""
        return gr.Button(value=value, **kwargs)
    
    @staticmethod
    def create_tool_button(value: str, **kwargs) -> Union['ToolButton', 'gr.Button']:
        """Create a tool button if available, otherwise regular button"""
        if ToolButton is not None:
            return ToolButton(value=value, **kwargs)
        else:
            return ButtonFactory.create_button(value=value, **kwargs)
    
    @staticmethod
    def create_refresh_button(**kwargs) -> Union['ToolButton', 'gr.Button']:
        """Create a refresh button"""
        return ButtonFactory.create_tool_button(value="\U0001f504", **kwargs)
    
    @staticmethod
    def create_fill_button(symbol: str = "📋", **kwargs) -> Union['ToolButton', 'gr.Button']:
        """Create a fill values button"""
        return ButtonFactory.create_tool_button(value=symbol, **kwargs)


class UIFactory:
    """Main UI factory for creating common component groups and patterns"""
    
    @staticmethod
    @safe_operation("Creating FreeU controls", ValidationError)
    def create_freeu_controls(enabled: bool = False) -> Dict[str, Any]:
        """Create FreeU control group (common pattern in extensions)"""
        return {
            'enabled': CheckboxFactory.create_enabled_checkbox("Enabled"),
            'b1': SliderFactory.create_scale_slider('B1', value=1.01),
            'b2': SliderFactory.create_scale_slider('B2', value=1.02),
            's1': SliderFactory.create_slider('S1', minimum=0, maximum=4, step=0.01, value=0.99),
            's2': SliderFactory.create_slider('S2', minimum=0, maximum=4, step=0.01, value=0.95),
            'start': SliderFactory.create_step_slider('Start step', value=0.0),
            'end': SliderFactory.create_step_slider('End step', value=1.0)
        }
    
    @staticmethod
    @safe_operation("Creating axis controls", ValidationError)
    def create_axis_controls(axis_name: str, axis_options: List[Any], 
                           fill_symbol: str = "📋") -> Dict[str, Any]:
        """Create XYZ grid axis controls (common pattern)"""
        axis_lower = axis_name.lower()
        
        return {
            'type': DropdownFactory.create_type_dropdown(
                f"{axis_name} type", axis_options,
                elem_id=f"xyz_grid_{axis_lower}_type"
            ),
            'values': TextboxFactory.create_values_textbox(
                f"{axis_name} values",
                elem_id=f"xyz_grid_{axis_lower}_values"
            ),
            'values_dropdown': DropdownFactory.create_dropdown(
                f"{axis_name} values", [], visible=False, 
                multiselect=True, interactive=True
            ),
            'fill_button': ButtonFactory.create_fill_button(
                fill_symbol,
                elem_id=f"xyz_grid_fill_{axis_lower}_tool_button",
                visible=False
            )
        }
    
    @staticmethod
    def create_seed_controls() -> Dict[str, Any]:
        """Create seed variation controls (common in XYZ grid)"""
        return {
            'vary_x': CheckboxFactory.create_checkbox(
                'Vary seeds for X', min_width=80,
                tooltip="Use different seeds for images along X axis."
            ),
            'vary_y': CheckboxFactory.create_checkbox(
                'Vary seeds for Y', min_width=80,
                tooltip="Use different seeds for images along Y axis."
            ),
            'vary_z': CheckboxFactory.create_checkbox(
                'Vary seeds for Z', min_width=80,
                tooltip="Use different seeds for images along Z axis."
            ),
            'no_fixed_seeds': CheckboxFactory.create_checkbox(
                'Keep -1 for seeds', value=False
            )
        }
    
    @staticmethod
    def create_grid_controls() -> Dict[str, Any]:
        """Create grid display controls"""
        return {
            'draw_legend': CheckboxFactory.create_toggle_checkbox('Draw legend', default=True),
            'include_lone_images': CheckboxFactory.create_checkbox('Include Sub Images'),
            'include_sub_grids': CheckboxFactory.create_checkbox('Include Sub Grids'),
            'csv_mode': CheckboxFactory.create_checkbox('Use text inputs instead of dropdowns'),
            'margin_size': SliderFactory.create_margin_slider()
        }
    
    @staticmethod
    @safe_operation("Creating dynamic thresholding controls", ValidationError)
    def create_dynamic_thresholding_controls() -> Dict[str, Any]:
        """Create Dynamic Thresholding controls (common extension pattern)"""
        mode_choices = [
            'Constant', 'Linear Down', 'Cosine Down', 'Half Cosine Down',
            'Linear Up', 'Cosine Up', 'Half Cosine Up', 'Power Up', 'Power Down',
            'Linear Repeating', 'Cosine Repeating', 'Sawtooth'
        ]
        
        return {
            'enabled': CheckboxFactory.create_enabled_checkbox(),
            'mimic_scale': SliderFactory.create_slider(
                'Mimic Scale', minimum=0.0, maximum=100.0, step=0.5, value=7.0
            ),
            'threshold_percentile': SliderFactory.create_percentage_slider(
                'Threshold Percentile', value=1.0
            ),
            'mimic_mode': gr.Radio(label='Mimic Mode', choices=mode_choices, value='Constant'),
            'cfg_mode': gr.Radio(label='Cfg Mode', choices=mode_choices, value='Constant'),
            'mimic_scale_min': SliderFactory.create_slider(
                'Mimic Scale Min', minimum=0.0, maximum=100.0, step=0.5, value=0.0
            ),
            'cfg_scale_min': SliderFactory.create_slider(
                'Cfg Scale Min', minimum=0.0, maximum=100.0, step=0.5, value=0.0
            )
        }
    
    @staticmethod
    def create_layout_row(*components, **kwargs) -> 'gr.Row':
        """Create a row layout with components"""
        with gr.Row(**kwargs) as row:
            for component in components:
                if component is not None:
                    component.render()
        return row
    
    @staticmethod
    def create_layout_column(*components, **kwargs) -> 'gr.Column':
        """Create a column layout with components"""
        with gr.Column(**kwargs) as column:
            for component in components:
                if component is not None:
                    component.render()
        return column


# Convenience functions for backward compatibility
def create_slider(label: str, **kwargs) -> 'gr.Slider':
    """Convenience function for creating sliders"""
    return SliderFactory.create_slider(label, **kwargs)

def create_checkbox(label: str, **kwargs) -> 'gr.Checkbox':
    """Convenience function for creating checkboxes"""
    return CheckboxFactory.create_checkbox(label, **kwargs)

def create_dropdown(label: str, choices: List[str], **kwargs) -> 'gr.Dropdown':
    """Convenience function for creating dropdowns"""
    return DropdownFactory.create_dropdown(label, choices, **kwargs)

# Export commonly used classes and functions
__all__ = [
    # Main factories
    'UIFactory', 'SliderFactory', 'CheckboxFactory', 'DropdownFactory',
    'TextboxFactory', 'ButtonFactory',
    
    # Configuration
    'ComponentConfig',
    
    # Convenience functions
    'create_slider', 'create_checkbox', 'create_dropdown'
]
