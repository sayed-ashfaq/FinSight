import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from pydantic import BaseModel
from typing import List, Dict, Any
from services.pdf_parser import parse_kotak_statement

router = APIRouter()

class ParseResponse(BaseModel):
    status: str
    message: str
    transactions: List[Dict[str, Any]]

@router.post("/upload", response_model=ParseResponse)
async def upload_statement(
    file: UploadFile = File(...),
    password: str = Form(None)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        transactions = parse_kotak_statement(temp_file_path, password)
        
        return {
            "status": "success",
            "message": f"Successfully parsed {len(transactions)} transactions.",
            "transactions": transactions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
