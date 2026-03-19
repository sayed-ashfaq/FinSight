from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class TransactionBase(BaseModel):
    date: str
    description: str
    ref_no: str
    amount: float
    balance: float
    type: str
    category: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionOut(TransactionBase):
    id: str
    statement_id: str
    model_config = ConfigDict(from_attributes=True)

class StatementBase(BaseModel):
    filename: str

class StatementCreate(StatementBase):
    pass

class StatementOut(StatementBase):
    id: str
    user_id: str
    uploaded_at: datetime
    transactions: List[TransactionOut] = []
    model_config = ConfigDict(from_attributes=True)

class UserOut(BaseModel):
    id: str
    email: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
