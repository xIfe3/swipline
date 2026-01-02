from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.websockets import WebSocket, WebSocketDisconnect
import json
import asyncio

from app import schemas, crud
from app.database import get_db

router = APIRouter()

# Store active WebSocket connections
active_connections = {}


@router.get("/{tracking_id}", response_model=schemas.TrackingResponse)
def track_parcel(tracking_id: str, db: Session = Depends(get_db)):
    """Public tracking endpoint (no auth required)"""
    tracking_data = crud.get_tracking_history(db, tracking_id)

    if not tracking_data:
        raise HTTPException(status_code=404, detail="Tracking ID not found")

    return tracking_data


@router.websocket("/ws/{tracking_id}")
async def websocket_tracking(websocket: WebSocket, tracking_id: str):
    """WebSocket for real-time tracking updates"""
    await websocket.accept()

    # Add connection to active connections
    if tracking_id not in active_connections:
        active_connections[tracking_id] = []
    active_connections[tracking_id].append(websocket)

    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()

    except WebSocketDisconnect:
        # Remove connection when disconnected
        if tracking_id in active_connections:
            active_connections[tracking_id].remove(websocket)
            if not active_connections[tracking_id]:
                del active_connections[tracking_id]


async def broadcast_location_update(tracking_id: str, update_data: dict):
    """Broadcast location update to all connected clients"""
    if tracking_id in active_connections:
        for connection in active_connections[tracking_id]:
            try:
                await connection.send_json(update_data)
            except:
                pass  # Connection might be closed


@router.post("/{tracking_id}/subscribe")
def subscribe_to_updates(tracking_id: str, db: Session = Depends(get_db)):
    """Subscribe to tracking updates (for polling)"""
    # This is for HTTP polling fallback
    parcel = crud.get_parcel_by_tracking_id(db, tracking_id)

    if not parcel:
        raise HTTPException(status_code=404, detail="Parcel not found")

    return {
        "tracking_id": tracking_id,
        "status": "subscribed",
        "current_location": parcel.current_location,
        "last_updated": parcel.updated_at,
    }
