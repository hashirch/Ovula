# Placeholder Screenshots

If you want to add placeholder images before taking actual screenshots, you can use these free tools:

## Online Placeholder Generators

1. **Placeholder.com**
   - URL: https://placeholder.com/
   - Example: `https://via.placeholder.com/1920x1080.png?text=Dashboard`

2. **DummyImage.com**
   - URL: https://dummyimage.com/
   - Example: `https://dummyimage.com/1920x1080/cccccc/000000.png&text=Ovula+Dashboard`

3. **Placehold.co**
   - URL: https://placehold.co/
   - Example: `https://placehold.co/1920x1080/png?text=Dashboard`

## Quick Placeholder Commands

You can download placeholders using curl:

```bash
# Dashboard placeholder
curl -o docs/screenshots/dashboard.png "https://via.placeholder.com/1920x1080.png?text=Dashboard"

# Chat placeholder
curl -o docs/screenshots/chat.png "https://via.placeholder.com/1920x1080.png?text=AI+Chat"

# Insights placeholder
curl -o docs/screenshots/insights.png "https://via.placeholder.com/1920x1080.png?text=Insights"

# Add Log placeholder
curl -o docs/screenshots/add-log.png "https://via.placeholder.com/1920x1080.png?text=Add+Log"

# Cycle Tracker placeholder
curl -o docs/screenshots/cycle-tracker.png "https://via.placeholder.com/1920x1080.png?text=Cycle+Tracker"

# Login placeholder
curl -o docs/screenshots/login.png "https://via.placeholder.com/1280x720.png?text=Login"

# Register placeholder
curl -o docs/screenshots/register.png "https://via.placeholder.com/1280x720.png?text=Register"
```

## Using ImageMagick (if installed)

Create colored placeholders with text:

```bash
# Install ImageMagick first
# Ubuntu/Debian: sudo apt-get install imagemagick
# Mac: brew install imagemagick

# Create placeholders
convert -size 1920x1080 xc:#4F46E5 -pointsize 72 -fill white -gravity center -annotate +0+0 "Dashboard" docs/screenshots/dashboard.png
convert -size 1920x1080 xc:#7C3AED -pointsize 72 -fill white -gravity center -annotate +0+0 "AI Chat" docs/screenshots/chat.png
convert -size 1920x1080 xc:#2563EB -pointsize 72 -fill white -gravity center -annotate +0+0 "Insights" docs/screenshots/insights.png
convert -size 1920x1080 xc:#059669 -pointsize 72 -fill white -gravity center -annotate +0+0 "Add Log" docs/screenshots/add-log.png
convert -size 1920x1080 xc:#DC2626 -pointsize 72 -fill white -gravity center -annotate +0+0 "Cycle Tracker" docs/screenshots/cycle-tracker.png
convert -size 1280x720 xc:#EA580C -pointsize 60 -fill white -gravity center -annotate +0+0 "Login" docs/screenshots/login.png
convert -size 1280x720 xc:#CA8A04 -pointsize 60 -fill white -gravity center -annotate +0+0 "Register" docs/screenshots/register.png
```

## Remember

⚠️ **Replace placeholders with actual screenshots before final submission!**

Placeholders are useful for:
- Testing README layout
- Showing structure to team members
- Temporary documentation

But always use real screenshots for:
- Final project submission
- GitHub repository
- Presentations
- FYP documentation
