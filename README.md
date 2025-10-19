# VidShrink

A single-page web application that compresses video files to under 10MB for Discord uploads using FFmpeg WebAssembly.

## Features

- **Client-side processing**: All video compression happens in your browser
- **Target size control**: Automatically compress videos to fit Discord's 10MB limit
- **Quality presets**: Choose between Fast, Medium, and Slow compression modes
- **Verbose logging**: Real-time progress updates and detailed processing information
- **No server required**: Pure HTML/CSS/JavaScript implementation

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

- **VidShrink Class**: Main application controller handling UI interactions and video processing
- **FFmpeg WebAssembly**: Video compression engine loaded from CDN
- **Compression Algorithm**: Dynamic bitrate calculation based on target file size
- **Progress System**: Real-time updates during compression process

### Compression Strategy

1. **File Analysis**: Calculate input file size and compression ratio needed
2. **Bitrate Calculation**: Estimate target bitrate based on file size and estimated duration
3. **Quality Presets**:
   - **Fast**: `ultrafast` preset with fixed bitrate
   - **Medium**: `medium` preset with calculated bitrate + faststart flag
   - **Slow**: `slow` preset with CRF 28 and max bitrate constraints
4. **Output Optimization**: MP4 format with H.264 video and AAC audio

### Browser Requirements

- Modern browser with WebAssembly support
- Sufficient memory for video processing (depends on input file size)
- JavaScript enabled

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

### FFmpeg Loading on GitHub Pages

**Good news**: The app now uses FFmpeg.wasm 0.10.1 which works on GitHub Pages without SharedArrayBuffer!

- **First load**: May take 10-20 seconds to download FFmpeg core files
- **Subsequent loads**: Should be faster due to browser caching
- **No server required**: Works directly from GitHub Pages

### Legacy SharedArrayBuffer Issues (0.11+)

If using newer FFmpeg.wasm versions locally:

1. **Use the included HTTP server**: Run `python server.py` and access via `http://localhost:8000`
2. **Alternative**: Use any HTTP server that sets CORP/COOP headers

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

- [FFmpeg WebAssembly 0.10.1](https://github.com/ffmpegwasm/ffmpeg.wasm) (loaded via CDN)
- No build process or package manager required
- Works on GitHub Pages without additional configuration
