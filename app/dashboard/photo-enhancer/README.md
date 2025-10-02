# Photo Enhancer Documentation

## Background Removal Features

The Photo Enhancer tool offers two different background removal options:

### 1. Standard Background Removal

Uses the `@imgly/background-removal` library to remove backgrounds from any type of image. This is a general-purpose solution that works well for most images.

**How to use:**

1. Upload an image
2. Click the "Remove Background" button
3. Wait for processing to complete
4. The background will be removed, creating a transparent PNG

### 2. Specialized Car Background Removal

This feature is specifically optimized for automotive photography. It uses an edge detection algorithm that samples the image edges to identify the most likely background color, then removes pixels matching that color.

**How to use:**

1. Upload a car image (works best with cars photographed against a relatively uniform background)
2. Click the "Remove Car Background" button
3. Wait for processing to complete
4. The background will be removed, creating a transparent PNG
5. Fine-tune results with the threshold slider:
   - Lower values (10-30): More precise, preserves details but may leave some background
   - Medium values (30-50): Balanced removal for most car photos
   - Higher values (50-100): More aggressive removal, may affect car edges
6. Click "Apply Threshold" to reprocess with new settings

**Best practices for car background removal:**

- Use images where the car is clearly distinguished from the background
- Images with solid color or gradient backgrounds work best
- Avoid complex backgrounds with colors similar to the car
- For best results, ensure the car doesn't touch the edges of the image
- Experiment with different threshold values for optimal results

### Background Color Options

After removing the background with either method, you can:

1. Keep the transparent background
2. Apply a solid color background
3. Choose from preset colors or use the color picker

## Troubleshooting

If you encounter issues with background removal:

1. **Standard removal not working well:**
   - Try the specialized car background removal instead
2. **Car background removal not detecting edges properly:**

   - Crop the image to ensure the car doesn't touch the image edges
   - Try using an image with more contrast between the car and background
   - Adjust the threshold slider:
     - If too much background remains: Increase the threshold
     - If parts of the car are becoming transparent: Decrease the threshold

3. **Background color appears in parts of the car:**
   - Try lowering the threshold value
   - Use the standard background removal method instead
