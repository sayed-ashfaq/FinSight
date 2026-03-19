import os
import shutil
from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from models.database import get_db
from models.models import Statement, Transaction, User
from models.schemas import StatementOut, TransactionOut
from utils.auth import get_current_user
from utils.logger import log
from services.pdf_parser import parse_kotak_statement

router = APIRouter()

@router.post("/upload")
async def upload_statement(
    file: UploadFile = File(...),
    password: str = Form(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        log.warning(f"Upload rejected: Non-PDF file {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        
    user_id = current_user.get("sub", "local-test-uuid")
    email = current_user.get("email", "unknown@test.com")
    
    # Ensure profile exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(id=user_id, email=email)
        db.add(user)
        db.commit()
        
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, file.filename)
    
    try:
        log.info(f"Receiving file chunk from {user_id}. Path: {temp_file_path}")
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Parse PDF using secure unlocking mechanism
        transactions = parse_kotak_statement(temp_file_path, password)
        
        # Persist Statement metadata
        new_stmt = Statement(user_id=user.id, filename=file.filename)
        db.add(new_stmt)
        db.commit()
        db.refresh(new_stmt)
        
        # Build bulk transaction query array
        tx_objects = []
        for t in transactions:
            tx = Transaction(
                statement_id=new_stmt.id,
                date=t.get("date"),
                description=t.get("description"),
                ref_no=t.get("ref_no"),
                amount=t.get("amount"),
                balance=t.get("balance"),
                type=t.get("type")
            )
            tx_objects.append(tx)
        
        db.bulk_save_objects(tx_objects)
        db.commit()
        
        log.info(f"Successfully digested and stored {len(tx_objects)} transactions linked to Statement UUID: {new_stmt.id}")
        
        return {
            "status": "success",
            "message": f"Successfully parsed and stored {len(transactions)} transactions.",
            "transactions": transactions
        }
    except Exception as e:
        log.error(f"Critical Parsing Engine Failure - Trace: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")
    finally:
        # Immediate cleanup of sensitive financial PDFs post-processing
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
            log.info(f"Scrubbed temp buffer: {temp_file_path}")

@router.get("/history")
async def get_statement_history(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.get("sub", "local-test-uuid")
    log.info(f"Fetching history payload for user: {user_id}")
    
    statements = db.query(Statement).filter(Statement.user_id == user_id).order_by(Statement.uploaded_at.desc()).all()
    
    res = []
    for s in statements:
        txs = db.query(Transaction).filter(Transaction.statement_id == s.id).all()
        res.append({
            "id": s.id,
            "filename": s.filename,
            "uploaded_at": s.uploaded_at,
            "transactions": [{"date": t.date, "description": t.description, "amount": t.amount, "type": t.type, "balance": t.balance} for t in txs]
        })
        
    return res
