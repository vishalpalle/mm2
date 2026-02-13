import os
import cv2
import uuid
import json
import shutil


from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware


import re
import base64
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) 

# ==================================================
# Configuration
# ==================================================


UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)



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
        "ffprobe",
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
# GPT-4o Vision Analysis
# ==================================================

def analyze_with_gpt4o(video_path):
    print("Starting GPT-4o Video Analysis...")
    cap = cv2.VideoCapture(video_path)
    
    base64Frames = []
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0: fps = 30
    
    frame_interval = int(fps) # 1 frame per second
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            _, buffer = cv2.imencode(".jpg", frame)
            base64Frames.append(base64.b64encode(buffer).decode("utf-8"))
            
        frame_count += 1
        
    cap.release()
    print(f"Extracted {len(base64Frames)} frames for analysis.")

    # Chunking to avoid token limits (10 frames per request)
    chunk_size = 10
    all_telemetry = []
    
    for i in range(0, len(base64Frames), chunk_size):
        chunk = base64Frames[i:i+chunk_size]
        print(f"Processing chunk {i//chunk_size + 1}...")
        
        messages = [
            {
                "role": "system",
                "content": "You are an ISR telemetry extractor. Analyze these video frames. For each frame, read the Green HUD text to extract: Speed (km/h), Altitude (ft), Latitude, Longitude. Also detect if a 'Target' (vehicle/ship) is visible. Return valid JSON only: [{ 'time': 0, 'telemetry': { 'lat': 35.85, 'lon': 14.51, 'speed': 800, 'alt': 20000 }, 'target_detected': true }]. The time should correspond to the frame index (e.g. frame 0 is time 0, frame 1 is time 1)."
            },
            {
                "role": "user",
                "content": [
                    *map(lambda x: {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{x}"}}, chunk)
                ],
            }
        ]
        
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=2000,
            )
            
            content = response.choices[0].message.content
            # Cleanup JSON string
            json_str = content.replace("```json", "").replace("```", "").strip()
            chunk_data = json.loads(json_str)
            
            # Adjust time based on chunk offset
            for item in chunk_data:
                item['time'] = item.get('time', 0) + i
                
            all_telemetry.extend(chunk_data)
            
        except Exception as e:
            print(f"Error processing chunk {i}: {e}")
            
    return all_telemetry


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

    
    # New processing (GPT-4o)
    visual_telemetry = []
    try:
        visual_telemetry = analyze_with_gpt4o(path)
    except Exception as e:
        print(f"GPT-4o Analysis Failed: {e}")
        visual_telemetry = []

    return JSONResponse({
        "video_id": vid,
        "metadata": metadata,
        "embedded_telemetry": telemetry,
        "visual_telemetry": visual_telemetry
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
