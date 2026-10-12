export const mediaConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true },
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 24, max: 30 }
  }
};
export const displayConstraints = { video: true, audio: false };
