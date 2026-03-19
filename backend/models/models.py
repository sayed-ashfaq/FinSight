from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True) # Matches Supabase Auth UUID
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    statements = relationship("Statement", back_populates="owner")

class Statement(Base):
    __tablename__ = "statements"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    filename = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="statements")
    transactions = relationship("Transaction", back_populates="statement", cascade="all, delete")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(String, primary_key=True, index=True, default=generate_uuid)
    statement_id = Column(String, ForeignKey("statements.id"))
    date = Column(String)
    category = Column(String, nullable=True)
    description = Column(String)
    ref_no = Column(String)
    amount = Column(Float)
    balance = Column(Float)
    type = Column(String)

    statement = relationship("Statement", back_populates="transactions")
