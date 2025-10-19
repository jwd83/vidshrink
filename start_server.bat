@echo off
echo Starting VidShrink HTTP Server...
echo.
echo This will start a local server on http://localhost:8000
echo The server is required for FFmpeg.wasm to work properly.
echo.
echo Press Ctrl+C to stop the server when you're done.
echo.

python server.py

pause