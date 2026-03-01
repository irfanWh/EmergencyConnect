import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json

from models import AlertCreate, AlertResponse, AlertStatus
from database import supabase
from services.ai_agent import generate_ai_guidance

app = FastAPI(title="EmergencyConnect MVP")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For MVP, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- WEBSOCKET MANAGER ---
class ConnectionManager:
    def __init__(self):
        # Maps alert_id to a list of active websocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, alert_id: str):
        await websocket.accept()
        if alert_id not in self.active_connections:
            self.active_connections[alert_id] = []
        self.active_connections[alert_id].append(websocket)

    def disconnect(self, websocket: WebSocket, alert_id: str):
        if alert_id in self.active_connections:
            self.active_connections[alert_id].remove(websocket)
            if not self.active_connections[alert_id]:
                del self.active_connections[alert_id]

    async def broadcast_to_room(self, message: dict, alert_id: str):
        if alert_id in self.active_connections:
            for connection in self.active_connections[alert_id]:
                await connection.send_text(json.dumps(message))

manager = ConnectionManager()

# --- ROUTES ---

@app.get("/")
def read_root():
    return {"message": "EmergencyConnect API is running"}

@app.post("/alerts", response_model=AlertResponse)
async def create_alert(alert: AlertCreate, background_tasks: BackgroundTasks):
    try:
        # 1. Insert alert into Supabase
        # Note: We simulate a patient_id for the MVP if auth isn't strict yet
        data, count = supabase.table("emergency_alerts").insert({
            "patient_id": "00000000-0000-0000-0000-000000000001", # Placeholder uuid for MVP 
            "symptoms": alert.symptoms,
            "status": AlertStatus.active
        }).execute()
        
        created_alert = data[1][0]
        alert_id = str(created_alert['id'])

        # 2. Insert location
        supabase.table("locations").insert({
            "alert_id": alert_id,
            "user_id": "00000000-0000-0000-0000-000000000001",
            "latitude": alert.latitude,
            "longitude": alert.longitude
        }).execute()

        # 3. Trigger AI Agent built-in Background Task
        # Because we can't easily wait here without blocking, we pass alert_id
        background_tasks.add_task(process_ai_guidance, alert_id, alert.symptoms)

        return created_alert
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_ai_guidance(alert_id: str, symptoms: str):
    """Background task to fetch AI response and broadcast it."""
    guidance = await generate_ai_guidance(symptoms)
    
    # Update Database
    supabase.table("emergency_alerts").update({
        "ai_guidance": guidance
    }).eq("id", alert_id).execute()
    
    # Broadcast to the room via WebSocket so frontend updates instantly
    await manager.broadcast_to_room({
        "type": "AI_UPDATE",
        "guidance": guidance
    }, alert_id)

@app.websocket("/ws/{alert_id}")
async def websocket_endpoint(websocket: WebSocket, alert_id: str):
    await manager.connect(websocket, alert_id)
    try:
        while True:
            # Receive text (e.g. driver coordinates updates)
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Broadcast the location update to everyone in this alert's room
            await manager.broadcast_to_room({
                "type": "LOCATION_UPDATE",
                "data": message_data
            }, alert_id)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, alert_id)

