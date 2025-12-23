import { useEffect, useRef, useState } from "react";
import NavigationBar from "../components/NavigationBar";
import { useAuth } from "../hooks";
import { authFetch } from "../auth";

type Entry = {
  id: string;
  text: string;
  audioPath?: string;
  createdAt: string;
  isPublic?: boolean;
};

export default function Journal() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [isPublic, setIsPublic] = useState(false);

  function notify(message: string) {
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(message);
    } else {
      console.warn(message);
    }
  }

  useEffect(() => {
    fetchEntries();
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === "audioinput");
      setDevices(audioInputs);

      // Load saved device ID from localStorage
      const savedDeviceId = localStorage.getItem("jm_mic_device");

      // Check if saved device is still available
      if (
        savedDeviceId &&
        audioInputs.some((d) => d.deviceId === savedDeviceId)
      ) {
        setSelectedDeviceId(savedDeviceId);
      } else if (audioInputs.length > 0) {
        // Fallback to first available device
        setSelectedDeviceId(audioInputs[0].deviceId);
      }
    } catch (err) {
      console.error("Failed to load devices:", err);
    }
  }

  function handleDeviceChange(deviceId: string) {
    setSelectedDeviceId(deviceId);
    localStorage.setItem("jm_mic_device", deviceId);
  }

  async function fetchEntries() {
    try {
      const res = await authFetch("/api/journals/");
      if (res.status === 401) return setEntries([]);
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      // ignore for now
      setEntries([]);
    }
  }

  async function submit(textVal = text, audioBlob?: Blob) {
    // Don't save if text is empty and no audio
    if (!textVal.trim() && !audioBlob) {
      notify("Please enter some text or record audio before saving.");
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const tempEntry: Entry = {
      id: tempId,
      text: textVal ?? "",
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [tempEntry, ...(Array.isArray(prev) ? prev : [])]);

    const form = new FormData();
    form.append("text", textVal);
    form.append("isPublic", isPublic ? "true" : "false");
    if (audioBlob) {
      // Determine file extension based on blob type
      let extension = "webm";
      if (audioBlob.type.includes("mp4")) extension = "mp4";
      else if (audioBlob.type.includes("ogg")) extension = "ogg";
      form.append("audio", new File([audioBlob], `recording.${extension}`));
    }

    try {
      const res = await authFetch("/api/journals/", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to save");
      const created = await res.json();
      setEntries((prev) => [
        created,
        ...(Array.isArray(prev) ? prev : []).filter((e) => e.id !== tempId),
      ]);
      await fetchEntries();
    } catch (err) {
      setEntries((prev) =>
        Array.isArray(prev) ? prev.filter((e) => e.id !== tempId) : prev
      );
      console.error(err);
      notify("Failed to save entry");
    } finally {
      setText("");
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Are you sure you want to delete this entry?")) {
      return;
    }

    // Optimistically remove from UI
    const previousEntries = Array.isArray(entries) ? entries : [];
    setEntries((prev) =>
      Array.isArray(prev) ? prev.filter((e) => e.id !== id) : prev
    );

    try {
      const res = await authFetch(`/api/journals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch (err) {
      // Restore on error
      setEntries(previousEntries as Entry[]);
      console.error(err);
      notify("Failed to delete entry");
    }
  }

  async function startRecording() {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("mediaDevices.getUserMedia not available; using fallback");
      }

      // Check if using secure context (HTTPS)
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure && window.location.hostname !== "localhost") {
        console.warn(
          "Warning: Accessing from non-secure context. Microphone access may be limited."
        );
      }

      // Reset chunks before recording
      chunksRef.current = [];

      // Use selected device or fallback to default
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      // Add device constraint if a specific device is selected
      if (selectedDeviceId) {
        audioConstraints.deviceId = { exact: selectedDeviceId };
      }

      const stream = navigator.mediaDevices?.getUserMedia
        ? await navigator.mediaDevices.getUserMedia({ audio: audioConstraints })
        : ({} as MediaStream);

      // Keep stream reference alive
      streamRef.current = stream;

      // Check track state
      const audioTracks =
        typeof (stream as MediaStream).getAudioTracks === "function"
          ? (stream as MediaStream).getAudioTracks()
          : [];
      console.log("Audio tracks count:", audioTracks.length);
      if (audioTracks.length > 0) {
        const track = audioTracks[0];
        const trackSettings = track.getSettings();
        console.log("Track ready state:", track.readyState);
        console.log("Track enabled:", track.enabled);
        console.log("Using microphone:", track.label);
        console.log("Device ID:", trackSettings.deviceId);
      }

      // Use Web Audio API to verify audio is being captured
      const AudioContextClass =
        (window as unknown as { AudioContext?: typeof AudioContext })
          .AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      let audioContext: AudioContext | undefined;
      let analyzer: AnalyserNode | undefined;
      let dataArray: Uint8Array | undefined;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
        analyzer = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyzer);
        dataArray = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        console.log("Initial audio level:", average);
      }

      // Use browser default format
      const mr = new MediaRecorder(stream);

      console.log("Recording started");
      console.log("Actual MIME type from recorder:", mr.mimeType);
      console.log("MediaRecorder state:", mr.state);

      // Monitor audio levels during recording
      const levelCheckInterval =
        analyzer && dataArray
          ? setInterval(() => {
              analyzer!.getByteFrequencyData(
                dataArray! as Uint8Array<ArrayBuffer>
              );
              const levelSum = dataArray!.reduce((a, b) => a + b, 0);
              const levelAvg = levelSum / dataArray!.length;
              console.log("Audio level during recording:", levelAvg);
            }, 500)
          : undefined;

      mr.ondataavailable = (e) => {
        console.log(
          "Data available, size:",
          e.data.size,
          "bytes, type:",
          e.data.type
        );
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onstop = async () => {
        if (levelCheckInterval) clearInterval(levelCheckInterval);
        console.log(
          "Recording stopped. Total chunks collected:",
          chunksRef.current.length
        );
        const totalSize = chunksRef.current.reduce(
          (sum, chunk) => sum + chunk.size,
          0
        );
        console.log("Total data collected:", totalSize, "bytes");

        // Stop all tracks to release the microphone
        if (streamRef.current) {
          const tracks =
            typeof (streamRef.current as MediaStream).getTracks === "function"
              ? (streamRef.current as MediaStream).getTracks()
              : [];
          tracks.forEach((track: MediaStreamTrack) => {
            console.log("Stopping track:", track.kind);
            track.stop();
          });
          streamRef.current = null;
        }

        // Close audio context
        if (audioContext && audioContext.state !== "closed") {
          audioContext.close();
        }

        if (chunksRef.current.length === 0) {
          notify("No audio recorded. Please try again.");
          chunksRef.current = [];
          return;
        }

        // Use the actual MIME type from the MediaRecorder
        const mimeType = mr.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        console.log("Final blob size:", blob.size, "bytes");
        console.log("Blob type:", blob.type);
        chunksRef.current = [];

        if (blob.size === 0) {
          notify("Recording produced empty file. Please try again.");
          return;
        }

        await submit(text, blob);
      };

      mr.onerror = (event: Event) => {
        if (levelCheckInterval) clearInterval(levelCheckInterval);
        console.error("MediaRecorder error:", event);
        const error = (
          event as Event & { error?: { message?: string; name?: string } }
        ).error;
        notify(
          "Recording error: " + (error?.message ?? error?.name ?? "unknown")
        );
        if (
          streamRef.current &&
          typeof streamRef.current.getTracks === "function"
        ) {
          const tracks = streamRef.current.getTracks();
          tracks.forEach((track: MediaStreamTrack) => track.stop());
          streamRef.current = null;
        }
        if (audioContext && audioContext.state !== "closed") {
          audioContext.close();
        }
      };

      mediaRecorderRef.current = mr;
      mr.start(100); // Request data every 100ms
      setRecording(true);
    } catch (err) {
      console.error("Failed to start recording:", err);
      notify("Failed to access microphone: " + (err as Error).message);
      if (streamRef.current) {
        const tracks =
          typeof (streamRef.current as MediaStream).getTracks === "function"
            ? (streamRef.current as MediaStream).getTracks()
            : [];
        tracks.forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      }
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    mediaRecorderRef.current = null;
    setRecording(false);
  }

  return (
    <main className='site-container'>
      <NavigationBar
        isAuthenticated={isAuthenticated}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((v) => !v)}
      />

      <section style={{ marginTop: 16 }}>
        <label style={{ display: "block" }}>
          <span className='sr-only' aria-hidden>
            Journal text
          </span>
          <textarea
            aria-label='Journal text'
            className='journal-textarea'
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
          />
        </label>
        {devices.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <label
              htmlFor='mic-selector'
              style={{ display: "block", marginBottom: 4, fontSize: "0.9rem" }}
            >
              Microphone:
            </label>
            <select
              id='mic-selector'
              value={selectedDeviceId}
              onChange={(e) => handleDeviceChange(e.target.value)}
              disabled={recording}
              style={{
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
                fontSize: "0.9rem",
                minWidth: "200px",
                cursor: recording ? "not-allowed" : "pointer",
                opacity: recording ? 0.6 : 1,
              }}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className='controls'>
          <button aria-label='Save text entry' onClick={() => submit()}>
            Save Text
          </button>
          <label
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <input
              type='checkbox'
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span>Share publicly with followers</span>
          </label>
          {!recording ? (
            <button aria-label='Start recording' onClick={startRecording}>
              Start Voice
            </button>
          ) : (
            <button aria-label='Stop recording' onClick={stopRecording}>
              Stop Recording
            </button>
          )}
        </div>
      </section>

      <hr className='divider' />

      <section>
        <h2>Entries</h2>
        <ul className='entry-list' aria-live='polite'>
          {Array.isArray(entries) &&
            entries.map((e) => (
              <li key={e.id} className='entry'>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                    {new Date(e.createdAt).toLocaleString()}
                  </div>
                  <button
                    onClick={() => deleteEntry(e.id)}
                    aria-label={`Delete entry from ${new Date(
                      e.createdAt
                    ).toLocaleString()}`}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                      backgroundColor: "var(--danger, #dc3545)",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
                <div style={{ marginTop: 6 }}>{e.text}</div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                  }}
                >
                  {e.isPublic ? "Public" : "Private"}
                </div>
                {e.audioPath && (
                  <audio
                    aria-label={`audio-${e.id}`}
                    controls
                    src={`/uploads/${e.audioPath}`}
                  >
                    {/* Placeholder captions track: caption files can be added later with .vtt files */}
                    <track
                      kind='captions'
                      srcLang='en'
                      src={`/uploads/${e.audioPath}.vtt`}
                    />
                  </audio>
                )}
              </li>
            ))}
        </ul>
      </section>
    </main>
  );
}
