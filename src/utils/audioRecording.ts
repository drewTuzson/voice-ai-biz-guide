export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private onDataAvailable?: (blob: Blob) => void;
  private onLevelChange?: (level: number) => void;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;

  constructor(options?: {
    onDataAvailable?: (blob: Blob) => void;
    onLevelChange?: (level: number) => void;
  }) {
    this.onDataAvailable = options?.onDataAvailable;
    this.onLevelChange = options?.onLevelChange;
  }

  async start(): Promise<void> {
    try {
      // Request microphone permission
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Set up audio level monitoring
      if (this.onLevelChange) {
        this.setupAudioLevelMonitoring();
      }

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this.getSupportedMimeType()
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.getSupportedMimeType() 
        });
        this.onDataAvailable?.(audioBlob);
        this.cleanup();
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
    } catch (error) {
      console.error('Error starting audio recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
  }

  private setupAudioLevelMonitoring(): void {
    if (!this.stream) return;

    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(this.stream);
    
    source.connect(this.analyser);
    this.analyser.fftSize = 256;
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    this.monitorAudioLevel();
  }

  private monitorAudioLevel(): void {
    if (!this.analyser || !this.dataArray) return;

    const monitor = () => {
      this.analyser!.getByteFrequencyData(this.dataArray!);
      
      const sum = this.dataArray!.reduce((acc, value) => acc + value, 0);
      const average = sum / this.dataArray!.length;
      const normalizedLevel = average / 255;

      this.onLevelChange?.(normalizedLevel);
      this.animationFrame = requestAnimationFrame(monitor);
    };

    monitor();
  }

  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  private cleanup(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.analyser = null;
    this.dataArray = null;
  }

  // Check if recording is supported
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }
}

export const convertAudioToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};