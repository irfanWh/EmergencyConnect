from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"
    driver = "driver"

class AlertStatus(str, Enum):
    active = "active"
    resolved = "resolved"
    cancelled = "cancelled"

class AlertCreate(BaseModel):
    symptoms: str = Field(..., description="Description of the emergency")
    latitude: float = Field(..., description="Patient's latitude")
    longitude: float = Field(..., description="Patient's longitude")

class AlertResponse(BaseModel):
    id: str
    patient_id: str
    symptoms: str
    ai_guidance: Optional[str] = None
    status: AlertStatus
    created_at: str
