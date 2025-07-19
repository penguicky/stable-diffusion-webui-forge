#!/usr/bin/env python3
"""
Example Script Migration: Before and After UI Factory

This example shows how to migrate an existing Forge WebUI script
from repetitive UI component creation to using the UI Factory system.

This demonstrates the migration of a typical extension script pattern.
"""

# =============================================================================
# BEFORE: Original repetitive UI code (typical extension pattern)
# =============================================================================

def create_ui_original_way():
    """Original way of creating UI components (repetitive)"""
    import gradio as gr
    from modules.ui_components import ToolButton
    
    # This is how most extensions currently create their UI
    with gr.Accordion(open=False, label="My Extension"):
        # Enable/disable checkbox
        enabled = gr.Checkbox(label='Enabled', value=False)
        
        # Parameter sliders with repetitive patterns
        strength = gr.Slider(label='Strength', minimum=0.0, maximum=1.0, step=0.01, value=0.75)
        scale_factor = gr.Slider(label='Scale Factor', minimum=0.0, maximum=2.0, step=0.01, value=1.0)
        threshold = gr.Slider(label='Threshold', minimum=0.0, maximum=1.0, step=0.01, value=0.5)
        
        # Mode selection
        mode = gr.Radio(label='Mode', 
                       choices=['Constant', 'Linear', 'Cosine'], 
                       value='Constant')
        
        # Advanced controls
        with gr.Row():
            start_step = gr.Slider(label='Start Step', minimum=0.0, maximum=1.0, step=0.01, value=0.0)
            end_step = gr.Slider(label='End Step', minimum=0.0, maximum=1.0, step=0.01, value=1.0)
        
        # Preset system
        with gr.Row():
            preset_dropdown = gr.Dropdown(
                label='Presets', 
                choices=['Default', 'Strong', 'Subtle'], 
                value='Default',
                type='index'
            )
            refresh_presets = ToolButton(value="\U0001f504")
        
        # Grid controls (if this were an XYZ-style extension)
        with gr.Column():
            draw_legend = gr.Checkbox(label='Draw Legend', value=True)
            include_sub_images = gr.Checkbox(label='Include Sub Images', value=False)
            margin_size = gr.Slider(label='Margin (px)', minimum=0, maximum=500, step=2, value=0)
    
    return {
        'enabled': enabled,
        'strength': strength,
        'scale_factor': scale_factor,
        'threshold': threshold,
        'mode': mode,
        'start_step': start_step,
        'end_step': end_step,
        'preset_dropdown': preset_dropdown,
        'refresh_presets': refresh_presets,
        'draw_legend': draw_legend,
        'include_sub_images': include_sub_images,
        'margin_size': margin_size
    }

# =============================================================================
# AFTER: Using UI Factory (clean and maintainable)
# =============================================================================

def create_ui_with_factory():
    """New way using UI Factory (clean and reusable)"""
    from modules.common_imports import gr
    from modules.ui_factory import UIFactory, SliderFactory, CheckboxFactory, DropdownFactory, ButtonFactory
    
    with gr.Accordion(open=False, label="My Extension"):
        # Enable/disable checkbox
        enabled = CheckboxFactory.create_enabled_checkbox()
        
        # Parameter sliders using factory methods
        strength = SliderFactory.create_percentage_slider('Strength', value=0.75)
        scale_factor = SliderFactory.create_scale_slider('Scale Factor', value=1.0)
        threshold = SliderFactory.create_percentage_slider('Threshold', value=0.5)
        
        # Mode selection
        mode = gr.Radio(label='Mode', 
                       choices=['Constant', 'Linear', 'Cosine'], 
                       value='Constant')
        
        # Advanced controls using factory
        with gr.Row():
            start_step = SliderFactory.create_step_slider('Start Step', value=0.0)
            end_step = SliderFactory.create_step_slider('End Step', value=1.0)
        
        # Preset system using factory
        with gr.Row():
            preset_dropdown = DropdownFactory.create_dropdown(
                'Presets', 
                ['Default', 'Strong', 'Subtle'], 
                value='Default'
            )
            refresh_presets = ButtonFactory.create_refresh_button()
        
        # Grid controls using factory group
        grid_controls = UIFactory.create_grid_controls()
    
    return {
        'enabled': enabled,
        'strength': strength,
        'scale_factor': scale_factor,
        'threshold': threshold,
        'mode': mode,
        'start_step': start_step,
        'end_step': end_step,
        'preset_dropdown': preset_dropdown,
        'refresh_presets': refresh_presets,
        **grid_controls  # Unpack grid controls
    }

# =============================================================================
# ADVANCED EXAMPLE: Complex extension with multiple patterns
# =============================================================================

def create_complex_extension_original():
    """Complex extension UI - original repetitive way"""
    import gradio as gr
    from modules.ui_components import ToolButton
    
    with gr.Accordion(open=False, label="Advanced Image Enhancement"):
        # Main controls
        enabled = gr.Checkbox(label='Enabled', value=False)
        
        # Enhancement parameters
        with gr.Row():
            enhance_b1 = gr.Slider(label='B1', minimum=0, maximum=2, step=0.01, value=1.01)
            enhance_b2 = gr.Slider(label='B2', minimum=0, maximum=2, step=0.01, value=1.02)
        with gr.Row():
            enhance_s1 = gr.Slider(label='S1', minimum=0, maximum=4, step=0.01, value=0.99)
            enhance_s2 = gr.Slider(label='S2', minimum=0, maximum=4, step=0.01, value=0.95)
        
        # Timing controls
        with gr.Row():
            start_step = gr.Slider(label='Start Step', minimum=0.0, maximum=1.0, step=0.01, value=0.0)
            end_step = gr.Slider(label='End Step', minimum=0.0, maximum=1.0, step=0.01, value=1.0)
        
        # XYZ Grid-style controls
        with gr.Row():
            x_type = gr.Dropdown(label="X type", choices=['None', 'B1', 'B2', 'S1', 'S2'], type="index")
            x_values = gr.Textbox(label="X values", lines=1)
            fill_x_button = ToolButton(value="📋", visible=False)
        
        with gr.Row():
            y_type = gr.Dropdown(label="Y type", choices=['None', 'B1', 'B2', 'S1', 'S2'], type="index")
            y_values = gr.Textbox(label="Y values", lines=1)
            fill_y_button = ToolButton(value="📋", visible=False)
        
        # Grid display options
        with gr.Column():
            draw_legend = gr.Checkbox(label='Draw Legend', value=True)
            include_lone_images = gr.Checkbox(label='Include Sub Images', value=False)
            include_sub_grids = gr.Checkbox(label='Include Sub Grids', value=False)
            margin_size = gr.Slider(label='Grid Margins (px)', minimum=0, maximum=500, step=2, value=0)
    
    # This would be ~25 lines of repetitive component creation

def create_complex_extension_with_factory():
    """Complex extension UI - using UI Factory"""
    from modules.common_imports import gr
    from modules.ui_factory import UIFactory, CheckboxFactory
    
    with gr.Accordion(open=False, label="Advanced Image Enhancement"):
        # Main controls
        enabled = CheckboxFactory.create_enabled_checkbox()
        
        # Enhancement parameters (FreeU-style pattern)
        enhance_controls = UIFactory.create_freeu_controls()
        
        # XYZ Grid-style controls
        axis_options = ['None', 'B1', 'B2', 'S1', 'S2']
        x_controls = UIFactory.create_axis_controls('X', axis_options)
        y_controls = UIFactory.create_axis_controls('Y', axis_options)
        
        # Grid display options
        grid_controls = UIFactory.create_grid_controls()
    
    # This is only ~10 lines, a 60% reduction!
    
    return {
        'enabled': enabled,
        **enhance_controls,
        **x_controls,
        **y_controls,
        **grid_controls
    }

# =============================================================================
# MIGRATION BENEFITS ANALYSIS
# =============================================================================

def analyze_migration_benefits():
    """Analyze the benefits of migrating to UI Factory"""
    
    print("=" * 60)
    print("MIGRATION BENEFITS ANALYSIS")
    print("=" * 60)
    
    print("\n📊 CODE REDUCTION METRICS:")
    print("  Simple Extension:")
    print("    Before: ~15 lines of UI component creation")
    print("    After:  ~8 lines using factory methods")
    print("    Reduction: ~47% fewer lines")
    
    print("\n  Complex Extension:")
    print("    Before: ~25 lines of repetitive UI code")
    print("    After:  ~10 lines using factory groups")
    print("    Reduction: ~60% fewer lines")
    
    print("\n🔧 MAINTAINABILITY IMPROVEMENTS:")
    print("  ✓ Consistent parameter defaults across all extensions")
    print("  ✓ Centralized UI pattern definitions")
    print("  ✓ Easy to update common patterns globally")
    print("  ✓ Reduced copy-paste errors")
    
    print("\n🚀 DEVELOPER EXPERIENCE:")
    print("  ✓ Faster extension development")
    print("  ✓ Less boilerplate code to write")
    print("  ✓ Automatic parameter validation")
    print("  ✓ Consistent UI behavior across extensions")
    
    print("\n🎯 SPECIFIC PATTERN BENEFITS:")
    print("  • FreeU Pattern: 7 lines → 1 line (85% reduction)")
    print("  • XYZ Axis Pattern: 4 lines → 1 line (75% reduction)")
    print("  • Grid Controls: 4 lines → 1 line (75% reduction)")
    print("  • Slider Creation: Automatic validation and defaults")
    print("  • Button Creation: Automatic fallbacks for missing components")

def main():
    """Demonstrate the migration examples"""
    print("=" * 60)
    print("SCRIPT MIGRATION EXAMPLE")
    print("=" * 60)
    
    print("This example shows how to migrate existing Forge WebUI scripts")
    print("from repetitive UI component creation to the UI Factory system.")
    print("\nKey migration steps:")
    print("1. Replace repetitive gr.Slider() calls with SliderFactory methods")
    print("2. Use CheckboxFactory for common checkbox patterns")
    print("3. Replace component groups with UIFactory group methods")
    print("4. Use DropdownFactory for consistent dropdown creation")
    print("5. Replace ToolButton patterns with ButtonFactory methods")
    
    analyze_migration_benefits()
    
    print("\n" + "=" * 60)
    print("🎉 MIGRATION GUIDE COMPLETE")
    print("=" * 60)
    print("The UI Factory system is ready for integration!")
    print("Extensions can be migrated gradually or all at once.")
    print("Both old and new patterns can coexist during transition.")

if __name__ == "__main__":
    main()
