#!/usr/bin/env python3
"""
Simple HTTP server with CORS headers for FFmpeg.wasm
Enables SharedArrayBuffer by setting the required security headers.

Usage:
    python server.py

Then open http://localhost:8000 in your browser
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import unquote

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        
        # Add security headers required for SharedArrayBuffer
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        
        # Add cache control
        self.send_header('Cache-Control', 'no-cache')
        
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log message to show cleaner output"""
        print(f"[Server] {format % args}")

def main():
    port = 8000
    
    # Change to the script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"Starting VidShrink server on port {port}")
    print(f"Serving files from: {os.getcwd()}")
    print(f"Open your browser to: http://localhost:{port}")
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()