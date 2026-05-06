from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker
from app.database import DATABASE_URL
from app.models import Application
import sys

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

apps = session.query(Application).all()
for a in apps:
    timeline_len = len(a.timeline) if a.timeline else 0
    stages_len = len(a.custom_stages) if a.custom_stages else 0
    notes_len = len(a.notes) if a.notes else 0
    print(f"App: {a.id} {a.company} Timeline: {timeline_len} Stages: {stages_len} Notes: {notes_len}")
