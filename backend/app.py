import os
import cv2
import uuid
import json
import shutil
import numpy as np
import subprocess
import ffmpeg

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydub import AudioSegment

# ==================================================
# Configuration
# ==================================================

FFMPEG_BIN = r"C:\ffmpeg\bin\ffmpeg.exe"
FFPROBE_BIN = r"C:\ffmpeg\bin\ffprobe.exe"

os.environ["FFMPEG_BINARY"] = FFMPEG_BIN
os.environ["FFPROBE_BINARY"] = FFPROBE_BIN
os.environ["PATH"] += os.pathsep + os.path.dirname(FFMPEG_BIN)

UPLOAD_DIR = "uploads"
FUSED_FRAME_DIR = "output/fused_frames"
AUDIO_DIR = "output/audio"

ANALYSIS_SIZE = (320, 180)
FRAME_SKIP = 2

HIST_CUT_THRESHOLD = 0.65
PIXEL_CHANGE_RATIO = 0.04
FLOW_MAG_THRESHOLD = 1.2

CONFIRM_FRAMES = 4
MIN_SEGMENT_DURATION = 0.5

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(FUSED_FRAME_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

# ==================================================
# FastAPI App
# ==================================================

app = FastAPI(title="ISR-Grade Multimodal Video Segmentation API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================================================
# Basic Video Metadata (OpenCV)
# ==================================================

def extract_video_metadata(video_path):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    duration = frame_count / fps if fps else 0
    cap.release()

    return {
        "fps": round(fps, 2),
        "frame_count": frame_count,
        "resolution": f"{w}x{h}",
        "duration_sec": round(duration, 2)
    }

# ==================================================
# Embedded Telemetry & Container Metadata (FFprobe)
# ==================================================

def extract_embedded_telemetry(video_path):
    cmd = [
        FFPROBE_BIN,
        "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        "-show_streams",
        video_path
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    if result.returncode != 0:
        return {"error": "ffprobe_failed"}

    data = json.loads(result.stdout)

    telemetry = {
        "container": {},
        "video_stream": {},
        "audio_stream": {},
        "telemetry_stream": {},
        "gps": None
    }

    # Container
    fmt = data.get("format", {})
    telemetry["container"] = {
        "filename": fmt.get("filename"),
        "duration_sec": round(float(fmt.get("duration", 0)), 2),
        "bit_rate": fmt.get("bit_rate"),
        "size_bytes": fmt.get("size"),
        "tags": fmt.get("tags", {})
    }

    # Streams
    for s in data.get("streams", []):
        if s.get("codec_type") == "video":
            telemetry["video_stream"] = {
                "codec": s.get("codec_name"),
                "width": s.get("width"),
                "height": s.get("height"),
                "fps": eval(s.get("r_frame_rate", "0/1")),
                "rotation": s.get("tags", {}).get("rotate"),
                "tags": s.get("tags", {})
            }

        elif s.get("codec_type") == "audio":
            telemetry["audio_stream"] = {
                "codec": s.get("codec_name"),
                "sample_rate": s.get("sample_rate"),
                "channels": s.get("channels"),
                "tags": s.get("tags", {})
            }

        elif s.get("codec_type") == "data":
            telemetry["telemetry_stream"] = {
                "codec": s.get("codec_name"),
                "tags": s.get("tags", {})
            }

            tags = s.get("tags", {})
            if any(k.lower() in tags for k in ["gps", "latitude", "longitude", "location"]):
                telemetry["gps"] = tags

    return telemetry

# ==================================================
# Audio Energy Extraction
# ==================================================

def extract_audio_energy(video_path):
    audio_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}.wav")
    
    try:
        # Check if audio stream exists first to avoid ffmpeg error
        probe = ffmpeg.probe(video_path)
        audio_stream = next((s for s in probe['streams'] if s['codec_type'] == 'audio'), None)
        
        if not audio_stream:
            print(f"No audio stream found in {video_path}")
            return np.array([0.0])

        ffmpeg.input(video_path).output(
            audio_path, ac=1, ar=16000, loglevel="error"
        ).run(overwrite_output=True)

        audio = AudioSegment.from_wav(audio_path)
        samples = np.array(audio.get_array_of_samples()).astype(np.float32)
        
        # Avoid division by zero
        max_val = np.max(np.abs(samples))
        if max_val == 0:
            return np.array([0.0])
            
        samples /= max_val

        energies = []
        window = 1600  # 100 ms

        for i in range(0, len(samples), window):
            energies.append(np.mean(samples[i:i+window] ** 2))
            
        # Clean up
        if os.path.exists(audio_path):
            os.remove(audio_path)

        return np.array(energies)

    except ffmpeg.Error as e:
        print(f"FFmpeg error extracting audio: {e.stderr.decode() if e.stderr else str(e)}")
        if os.path.exists(audio_path):
            os.remove(audio_path)
        return np.array([0.0])
    except Exception as e:
        print(f"General error extracting audio: {e}")
        if os.path.exists(audio_path):
            os.remove(audio_path)
        return np.array([0.0])

# ==================================================
# Vision Change Metrics
# ==================================================

def histogram_distance(f1, f2):
    h1 = cv2.calcHist([cv2.cvtColor(f1, cv2.COLOR_BGR2HSV)], [0,1], None, [32,32], [0,180,0,256])
    h2 = cv2.calcHist([cv2.cvtColor(f2, cv2.COLOR_BGR2HSV)], [0,1], None, [32,32], [0,180,0,256])
    cv2.normalize(h1, h1)
    cv2.normalize(h2, h2)
    return cv2.compareHist(h1, h2, cv2.HISTCMP_BHATTACHARYYA)

def pixel_change_ratio(f1, f2):
    diff = cv2.absdiff(
        cv2.cvtColor(f1, cv2.COLOR_BGR2GRAY),
        cv2.cvtColor(f2, cv2.COLOR_BGR2GRAY)
    )
    return np.count_nonzero(diff > 25) / diff.size

def motion_magnitude(g1, g2):
    flow = cv2.calcOpticalFlowFarneback(g1, g2, None, 0.5, 2, 15, 2, 5, 1.1, 0)
    mag, _ = cv2.cartToPolar(flow[...,0], flow[...,1])
    return np.mean(mag)

# ==================================================
# ISR Segmentation Engine
# ==================================================

def process_video_isr(video_path):
    cap = cv2.VideoCapture(video_path)
    audio_energy = extract_audio_energy(video_path)

    fused_frames = []
    prev_small, prev_gray = None, None
    rep_frame = None

    fuse_start = 0
    current_time = 0
    frame_idx = 0
    change_votes = 0
    confidence_accumulator = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_idx += 1
        if frame_idx % FRAME_SKIP != 0:
            continue

        current_time = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000.0
        small = cv2.resize(frame, ANALYSIS_SIZE)
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

        if prev_small is None:
            prev_small, prev_gray = small, gray
            rep_frame = frame
            fuse_start = current_time
            continue

        hist = histogram_distance(prev_small, small)
        pixel = pixel_change_ratio(prev_small, small)
        motion = pixel > PIXEL_CHANGE_RATIO and motion_magnitude(prev_gray, gray) > FLOW_MAG_THRESHOLD

        audio_idx = min(int(current_time * 10), len(audio_energy) - 1)
        audio_change = audio_energy[audio_idx] > np.mean(audio_energy) * 2

        confidence = hist + (1.5 if motion else 0) + (1.0 if audio_change else 0)
        confidence_accumulator.append(confidence)

        if hist > HIST_CUT_THRESHOLD or motion or audio_change:
            change_votes += 1
        else:
            change_votes = max(0, change_votes - 1)

        if change_votes >= CONFIRM_FRAMES and (current_time - fuse_start) >= MIN_SEGMENT_DURATION:
            fid = str(uuid.uuid4())
            path = os.path.join(FUSED_FRAME_DIR, f"{fid}.jpg")
            cv2.imwrite(path, rep_frame)

            fused_frames.append({
                "frame_id": fid,
                "start_time": round(fuse_start, 2),
                "end_time": round(current_time, 2),
                "confidence": round(np.mean(confidence_accumulator), 3),
                "path": path
            })

            rep_frame = frame
            fuse_start = current_time
            change_votes = 0
            confidence_accumulator.clear()

        prev_small, prev_gray = small, gray

    cap.release()
    return fused_frames

# ==================================================
# API: Upload Video
# ==================================================

@app.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    vid = str(uuid.uuid4())
    path = os.path.join(UPLOAD_DIR, f"{vid}_{file.filename}")

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    metadata = extract_video_metadata(path)
    telemetry = extract_embedded_telemetry(path)
    segments = process_video_isr(path)

    return JSONResponse({
        "video_id": vid,
        "metadata": metadata,
        "embedded_telemetry": telemetry,
        "fused_frame_count": len(segments),
        "fused_frames": segments
    })

# ==================================================
# API: RTSP / UAV Feed (stub)
# ==================================================

@app.post("/rtsp-stream")
async def rtsp_stream(rtsp_url: str):
    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        return JSONResponse({"error": "Unable to open RTSP stream"}, status_code=400)

    return JSONResponse({
        "status": "connected",
        "note": "Frame-by-frame ISR processing ready"
    })
