from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import DATABASE_URL
from app.models import User
import sys
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()
users = session.query(User).all()
for u in users:
    print(f"User: {u.id} {u.name} {u.email} Avatar len: {len(u.avatar) if u.avatar else 0}")
