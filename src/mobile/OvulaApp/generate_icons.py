#!/usr/bin/env python3
"""
Generate Android launcher icons from the Ovula logo
"""
from PIL import Image
import os

# Icon sizes for different densities
ICON_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192
}

def generate_icons(source_image_path, output_base_path):
    """Generate launcher icons for all densities"""
    
    # Load the source image
    print(f"Loading source image: {source_image_path}")
    img = Image.open(source_image_path)
    
    # Convert to RGBA if not already
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    print(f"Source image size: {img.size}")
    
    # Generate icons for each density
    for density, size in ICON_SIZES.items():
        print(f"\nGenerating {density} icons ({size}x{size})...")
        
        # Create output directory
        output_dir = os.path.join(output_base_path, f'mipmap-{density}')
        os.makedirs(output_dir, exist_ok=True)
        
        # Resize image
        resized = img.resize((size, size), Image.Resampling.LANCZOS)
        
        # Save regular icon
        regular_path = os.path.join(output_dir, 'ic_launcher.png')
        resized.save(regular_path, 'PNG')
        print(f"  ✓ Created: {regular_path}")
        
        # Save round icon (same image for now)
        round_path = os.path.join(output_dir, 'ic_launcher_round.png')
        resized.save(round_path, 'PNG')
        print(f"  ✓ Created: {round_path}")
    
    print("\n✅ All launcher icons generated successfully!")

if __name__ == '__main__':
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(script_dir)))
    source_logo = os.path.join(project_root, 'docs', 'ovula-logo.png')
    output_base = os.path.join(script_dir, 'app', 'src', 'main', 'res')
    
    print("=" * 60)
    print("Ovula Android Launcher Icon Generator")
    print("=" * 60)
    
    # Check if source exists
    if not os.path.exists(source_logo):
        print(f"❌ Error: Source logo not found at {source_logo}")
        exit(1)
    
    # Generate icons
    generate_icons(source_logo, output_base)
    
    print("\n" + "=" * 60)
    print("Icon generation complete!")
    print("=" * 60)
