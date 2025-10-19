class VidShrink {
    constructor() {
        this.ffmpeg = null;
        this.isLoaded = false;
        this.currentFile = null;
        this.compressedBlob = null;
        
        this.initializeElements();
        this.bindEvents();
        this.loadFFmpeg();
    }
    
    initializeElements() {
        this.videoInput = document.getElementById('videoInput');
        this.targetSizeInput = document.getElementById('targetSize');
        this.qualitySelect = document.getElementById('quality');
        this.compressBtn = document.getElementById('compressBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.progressBar = document.getElementById('progressFill');
        this.status = document.getElementById('status');
        this.logContainer = document.getElementById('logContainer');
        this.fileInfo = document.getElementById('fileInfo');
    }
    
    bindEvents() {
        this.videoInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.compressBtn.addEventListener('click', () => this.compressVideo());
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
    }
    
    async loadFFmpeg() {
        try {
            this.log('Initializing FFmpeg...');
            
            // Wait for FFmpeg to be available with retry logic
            let retries = 0;
            const maxRetries = 10;
            while (typeof FFmpeg === 'undefined' && retries < maxRetries) {
                this.log(`Waiting for FFmpeg library... (${retries + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 500));
                retries++;
            }
            
            if (typeof FFmpeg === 'undefined') {
                throw new Error('FFmpeg library failed to load after multiple attempts');
            }
            
            this.log('FFmpeg library detected, creating instance...');
            
            this.ffmpeg = FFmpeg.createFFmpeg({
                log: true,
                corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js',
                progress: (p) => {
                    const percentage = Math.round(p.ratio * 100);
                    this.updateProgress(percentage);
                    this.updateStatus(`Processing... ${percentage}%`);
                }
            });
            
            this.log('Loading FFmpeg core files...');
            await this.ffmpeg.load();
            
            this.isLoaded = true;
            this.log('FFmpeg loaded successfully');
            this.updateStatus('FFmpeg ready - Select a video file');
        } catch (error) {
            this.log(`Error loading FFmpeg: ${error.message}`);
            this.log('Please ensure you have a stable internet connection and try refreshing the page.');
            this.updateStatus('Error: Failed to load FFmpeg');
            console.error('FFmpeg loading error:', error);
        }
    }
    
    
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.currentFile = file;
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        
        this.log(`Selected file: ${file.name} (${sizeMB} MB)`);
        this.updateFileInfo(`Input: ${file.name} - ${sizeMB} MB`);
        
        if (this.isLoaded) {
            this.compressBtn.disabled = false;
            this.updateStatus('Ready to compress');
        } else {
            this.updateStatus('Waiting for FFmpeg to load...');
        }
    }
    
    async compressVideo() {
        if (!this.currentFile || !this.isLoaded) return;
        
        try {
            this.compressBtn.disabled = true;
            this.downloadBtn.style.display = 'none';
            this.updateProgress(0);
            
            const targetSizeMB = parseFloat(this.targetSizeInput.value);
            const quality = this.qualitySelect.value;
            
            this.log(`Starting compression to ${targetSizeMB} MB target...`);
            this.updateStatus('Loading video file...');
            
            // Write input file to FFmpeg filesystem
            const inputName = 'input.' + this.getFileExtension(this.currentFile.name);
            const outputName = 'output.mp4';
            
            this.ffmpeg.FS('writeFile', inputName, await this.fetchFile(this.currentFile));
            
            // Calculate compression parameters
            const inputSizeMB = this.currentFile.size / (1024 * 1024);
            const compressionRatio = Math.min(targetSizeMB / inputSizeMB, 0.95);
            
            this.log(`Input size: ${inputSizeMB.toFixed(2)} MB, Target: ${targetSizeMB} MB`);
            this.log(`Compression ratio: ${(compressionRatio * 100).toFixed(1)}%`);
            
            // Get video duration and calculate bitrate
            await this.ffmpeg.run('-i', inputName, '-hide_banner');
            
            // Calculate target bitrate (leaving some overhead)
            const targetBitrate = Math.floor((targetSizeMB * 8 * 1024) / this.getEstimatedDuration() * 0.9);
            
            this.log(`Estimated target bitrate: ${targetBitrate} kbps`);
            this.updateStatus('Compressing video...');
            
            // Build FFmpeg command based on quality preset
            let ffmpegArgs;
            if (quality === 'fast') {
                ffmpegArgs = [
                    '-i', inputName,
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast',
                    '-b:v', `${targetBitrate}k`,
                    '-c:a', 'aac',
                    '-b:a', '128k',
                    '-y',
                    outputName
                ];
            } else if (quality === 'slow') {
                ffmpegArgs = [
                    '-i', inputName,
                    '-c:v', 'libx264',
                    '-preset', 'slow',
                    '-crf', '28',
                    '-maxrate', `${targetBitrate}k`,
                    '-bufsize', `${targetBitrate * 2}k`,
                    '-c:a', 'aac',
                    '-b:a', '96k',
                    '-y',
                    outputName
                ];
            } else { // medium
                ffmpegArgs = [
                    '-i', inputName,
                    '-c:v', 'libx264',
                    '-preset', 'medium',
                    '-b:v', `${targetBitrate}k`,
                    '-c:a', 'aac',
                    '-b:a', '128k',
                    '-movflags', '+faststart',
                    '-y',
                    outputName
                ];
            }
            
            this.log(`FFmpeg command: ${ffmpegArgs.join(' ')}`);
            await this.ffmpeg.run(...ffmpegArgs);
            
            // Read the output file
            const data = this.ffmpeg.FS('readFile', outputName);
            this.compressedBlob = new Blob([data.buffer], { type: 'video/mp4' });
            
            const outputSizeMB = (this.compressedBlob.size / (1024 * 1024)).toFixed(2);
            
            this.log(`Compression completed! Output size: ${outputSizeMB} MB`);
            
            if (parseFloat(outputSizeMB) > targetSizeMB) {
                this.log(`Warning: Output size (${outputSizeMB} MB) exceeds target (${targetSizeMB} MB)`);
                this.updateStatus(`Completed - ${outputSizeMB} MB (above target)`);
            } else {
                this.updateStatus(`Completed - ${outputSizeMB} MB (under target!)`);
            }
            
            this.updateFileInfo(`Input: ${this.currentFile.name} - ${(inputSizeMB).toFixed(2)} MB → Output: compressed.mp4 - ${outputSizeMB} MB`);
            this.updateProgress(100);
            this.downloadBtn.style.display = 'block';
            
            // Clean up FFmpeg filesystem
            this.ffmpeg.FS('unlink', inputName);
            this.ffmpeg.FS('unlink', outputName);
            
        } catch (error) {
            this.log(`Error during compression: ${error.message}`);
            this.updateStatus('Error during compression');
        } finally {
            this.compressBtn.disabled = false;
        }
    }
    
    downloadVideo() {
        if (!this.compressedBlob) return;
        
        const url = URL.createObjectURL(this.compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed_video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('Download started');
    }
    
    async fetchFile(file) {
        return new Uint8Array(await file.arrayBuffer());
    }
    
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    
    getEstimatedDuration() {
        // Rough estimate - in a real implementation, you'd parse the FFmpeg output
        // For now, assume 30 seconds average duration
        return 30;
    }
    
    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${timestamp}] ${message}`;
        this.logContainer.appendChild(logEntry);
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
        console.log(message);
    }
    
    updateStatus(message) {
        this.status.textContent = message;
    }
    
    updateProgress(percentage) {
        this.progressBar.style.width = `${percentage}%`;
    }
    
    updateFileInfo(info) {
        this.fileInfo.textContent = info;
    }
}

// Initialize the application when the DOM and FFmpeg are loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add a small delay to ensure FFmpeg script is fully loaded
    setTimeout(() => {
        new VidShrink();
    }, 100);
});
