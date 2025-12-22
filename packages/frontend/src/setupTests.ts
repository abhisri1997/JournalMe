import "@testing-library/jest-dom";
// Prevent network calls during tests by stubbing global fetch
// Returns an empty list by default (no entries)
globalThis.fetch = async () =>
  ({
    ok: true,
    status: 200,
    json: async () => [],
  } as Response);

// jsdom environment does not provide mediaDevices or AudioContext.
// Provide minimal stubs so components can mount without throwing.
const mediaDevices: Partial<MediaDevices> = navigator.mediaDevices ?? {};

if (!mediaDevices.getUserMedia) {
  mediaDevices.getUserMedia = async () =>
    ({
      getAudioTracks: () => [],
    } as unknown as MediaStream);
}

if (!mediaDevices.enumerateDevices) {
  mediaDevices.enumerateDevices = async () => [] as MediaDeviceInfo[];
}

if (!navigator.mediaDevices) {
  Object.assign(navigator, { mediaDevices });
} else {
  Object.defineProperty(navigator, "mediaDevices", {
    value: mediaDevices as MediaDevices,
    writable: true,
  });
}

const audioContextGlobal = window as unknown as {
  AudioContext?: typeof AudioContext;
};
if (!audioContextGlobal.AudioContext) {
  class FakeAudioContext {
    state: AudioContextState = "closed";
    createAnalyser(): AnalyserNode {
      return {
        frequencyBinCount: 32,
        getByteFrequencyData: () => {},
      } as unknown as AnalyserNode;
    }
    createMediaStreamSource(): MediaStreamAudioSourceNode {
      return {
        connect: () => {},
      } as unknown as MediaStreamAudioSourceNode;
    }
    close(): void {}
  }
  audioContextGlobal.AudioContext =
    FakeAudioContext as unknown as typeof AudioContext;
}
