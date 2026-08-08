import json
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.domain import DatasetModel

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.json', '.csv')):
        raise HTTPException(status_code=400, detail="Only JSON and CSV dataset files are supported")
    
    try:
        content = await file.read()
        dataset_id = f"ds_{uuid.uuid4().hex[:8]}"
        
        if file.filename.endswith('.json'):
            parsed_data = json.loads(content.decode('utf-8'))
            route_count = len(parsed_data) if isinstance(parsed_data, list) else len(parsed_data.get("routes", []))
            stop_count = sum(len(r.get("stops", [])) for r in (parsed_data if isinstance(parsed_data, list) else parsed_data.get("routes", [])))
        else:
            parsed_data = {"raw_csv": content.decode('utf-8')}
            route_count = 1
            stop_count = len(content.decode('utf-8').splitlines()) - 1
            
        ds_entry = DatasetModel(
            id=dataset_id,
            filename=file.filename,
            route_count=route_count,
            stop_count=stop_count,
            raw_json=parsed_data if isinstance(parsed_data, dict) or isinstance(parsed_data, list) else None
        )
        db.add(ds_entry)
        db.commit()
        db.refresh(ds_entry)
        
        return {
            "message": "Dataset uploaded successfully",
            "dataset_id": dataset_id,
            "filename": file.filename,
            "route_count": route_count,
            "stop_count": stop_count
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")
