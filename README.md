# VidShrink

A single-page web application that compresses video files to under 10MB for Discord uploads using FFmpeg WebAssembly.

## Features

- **Client-side processing**: All video compression happens in your browser
- **Target size control**: Automatically compress videos to fit Discord's 10MB limit
- **Quality presets**: Choose between Fast, Medium, and Slow compression modes
- **Verbose logging**: Real-time progress updates and detailed processing information
- **No server required**: Pure HTML/CSS/JavaScript implementation

## Usage

### Option 1: Using Local HTTP Server (Recommended)

FFmpeg.wasm requires SharedArrayBuffer, which needs specific security headers:

1. **Start the local server**:
   - Windows: Double-click `start_server.bat`
   - Or run: `python server.py`
   
2. **Open browser**: Navigate to `http://localhost:8000`

3. **Use the app**:
   - Wait for FFmpeg to load
   - Select a video file
   - Adjust target size and quality
   - Click "Compress Video"
   - Download the result

### Option 2: File Protocol (Limited)

Opening `index.html` directly may not work due to SharedArrayBuffer restrictions. If it fails with "SharedArrayBuffer is not defined", use the local server method above.

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

### "SharedArrayBuffer is not defined" Error

This is a browser security restriction. FFmpeg.wasm requires specific HTTP headers:

1. **Use the included HTTP server**: Run `python server.py` and access via `http://localhost:8000`
2. **Alternative servers**: Use any HTTP server that sets CORP/COOP headers
3. **Browser settings**: Some browsers allow disabling security features for local development

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

## Dependencies

- [FFmpeg WebAssembly](https://github.com/ffmpegwasm/ffmpeg.wasm) (loaded via CDN)
- No build process or package manager required