# Logo Implementation Instructions

## To use your custom logo:

1. **Save your logo file** as either:
   - `/public/logo.png` (for PNG format)
   - `/public/logo.svg` (for SVG format - recommended for scalability)
   - `/public/logo.jpg` (for JPEG format)

2. **Update the image source** in the code if needed:
   - Current code uses: `src="/logo.svg"`
   - Change to `src="/logo.png"` if using PNG format
   - Change to `src="/logo.jpg"` if using JPEG format

3. **The logo will automatically**:
   - Scale to 24x24 pixels
   - Maintain aspect ratio with `object-fit: contain`
   - Apply dark theme-friendly filters
   - Display in the top-left sidebar header

## Current Implementation:
- ✅ Emoji (⚡) replaced with image
- ✅ Proper CSS styling for dark theme
- ✅ Responsive scaling
- ✅ Accessibility (alt text)
- ✅ SVG placeholder created

## File Location:
`/Users/jorikveselko/Documents/POVOLEAN/Zapier pre stavebný sektor/Povolean_vision/llm-flow-svelte/public/logo.svg`

Simply replace this file with your actual logo to see it in the application.
