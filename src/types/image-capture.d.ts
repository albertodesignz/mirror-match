interface ImageCaptureConstructor {
  new (videoTrack: MediaStreamTrack): ImageCapture;
}

interface ImageCapture {
  grabFrame(): Promise<ImageBitmap>;
  takePhoto(): Promise<Blob>;
}

declare var ImageCapture: ImageCaptureConstructor; 