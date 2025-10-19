# VidShrink

A single-page web application that compresses video files to under 10MB for Discord uploads using native browser APIs (Canvas + MediaRecorder).

## Features

- **Client-side processing**: All video compression happens in your browser using native APIs
- **Target size control**: Automatically compress videos to fit Discord's 10MB limit
- **Quality presets**: Choose between Low, Medium, and High quality compression
- **Real-time preview**: See compressed video before downloading
- **No external dependencies**: Uses Canvas API + MediaRecorder for reliable compression
- **Works everywhere**: Compatible with GitHub Pages and any static hosting

## Usage

### Option 1: GitHub Pages (Public Access)

The app is automatically deployed to GitHub Pages and works without any setup:

1. **Access online**: Visit your GitHub Pages URL (e.g., `https://yourusername.github.io/vidshrink`)
2. **Wait for FFmpeg to load** (first load may take 10-20 seconds)
3. **Use the app**:
   - Select a video file
   - Adjust target size and quality
   - Click "Compress Video"
   - Download the result

### Option 2: Local Development

For local testing and development:

1. **Direct file access**: Open `index.html` in your browser (should work with FFmpeg 0.10.1)
2. **Local server** (if needed): Run `python server.py` and access `http://localhost:8000`

## Technical Details

### Core Components

- **SimpleVidShrink Class**: Main application controller using native browser APIs
- **Canvas API**: For video frame rendering and resolution scaling
- **MediaRecorder API**: For video compression with VP9 codec
- **Dynamic Bitrate Calculation**: Automatically calculates optimal bitrate for target file size
- **Real-time Progress**: Live compression progress and preview

### Compression Strategy

1. **Video Analysis**: Extract video metadata (resolution, duration, bitrate)
2. **Resolution Scaling**: Automatically scale down resolution based on target size
3. **Bitrate Calculation**: Calculate optimal bitrate for target file size with overhead buffer
4. **Quality Presets**:
   - **Low Quality (0.3)**: Aggressive compression for smallest files
   - **Medium Quality (0.5)**: Balanced compression (default)
   - **High Quality (0.7)**: Preserve quality with larger file sizes
5. **Output Format**: WebM with VP9 video codec (efficient compression, wide support)

### Browser Requirements

- Modern browser with Canvas API support (Chrome 51+, Firefox 43+, Safari 11+, Edge 79+)
- MediaRecorder API with VP9 codec support (most modern browsers)
- JavaScript enabled
- Sufficient memory for video processing (depends on input file size)

### File Structure

```
vidshrink/
├── index.html      # Main application interface
├── app.js          # Core JavaScript functionality
├── style.css       # Basic styling
├── README.md       # This file
└── plan.md         # Original project requirements
```

## Troubleshooting

### MediaRecorder API Compatibility

The app now uses native browser APIs for maximum compatibility:

- **Supported browsers**: Chrome, Firefox, Safari 14.1+, Edge (all modern versions)
- **Codec support**: VP9 is preferred, falls back to available codecs
- **No external dependencies**: No CDN or WebAssembly issues

### Common Issues

1. **"MediaRecorder not supported"**: Update to a modern browser
2. **Large file sizes**: Try lower quality settings or shorter videos
3. **Slow compression**: Normal for large/long videos - browser-based processing
4. **WebM playback**: Most modern browsers and Discord support WebM

### FFmpeg Loading Issues

- Ensure stable internet connection for CDN resources
- Check browser console for detailed error messages
- Try refreshing the page if initial load fails
- Verify browser supports WebAssembly

## Limitations

- Processing time depends on video length and quality preset
- Large files (>100MB) may cause browser memory issues
- Duration estimation is currently hardcoded (30 seconds) - actual duration parsing would improve accuracy
- No support for batch processing
- Requires HTTP server for SharedArrayBuffer support

## Development

The application is designed for simplicity and functionality over aesthetics. To extend or modify:

1. **Add format support**: Modify `getFileExtension()` and FFmpeg command parameters
2. **Improve duration detection**: Parse FFmpeg output to get actual video duration
3. **Add two-pass encoding**: Implement more sophisticated bitrate control
4. **Better error handling**: Add specific error messages for common failure cases

## GitHub Pages Deployment

To deploy your own copy:

1. **Fork this repository**
2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Source: "Deploy from a branch"
   - Branch: "main" or "master"
   - Folder: "/ (root)"
3. **Access your deployment**: `https://yourusername.github.io/vidshrink`

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys changes when you push to the main branch.

## Dependencies

- **Zero external dependencies**: Uses only native browser APIs
- **Canvas API**: For video frame rendering (built into browsers)
- **MediaRecorder API**: For video compression (built into browsers)
- **No CDN or WebAssembly**: Completely self-contained
- **No build process**: Pure HTML/CSS/JavaScript

### FFmpeg.wasm Version (Backup)

The original FFmpeg.wasm implementation is preserved as `app-ffmpeg.js` for reference. The current implementation uses native browser APIs for better reliability and GitHub Pages compatibility.
