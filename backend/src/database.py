import os
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in backend/.env")

# Ensure proper SQLAlchemy MySQL driver prefix
if DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

# Clean non-standard query parameters and ensure utf8mb4 encoding
clean_url = re.sub(r'[?&]ssl[-_]mode=[^&]*', '', DATABASE_URL)
if '?' not in clean_url:
    clean_url += '?charset=utf8mb4'
elif 'charset=utf8mb4' not in clean_url:
    clean_url += '&charset=utf8mb4'

# SSL arguments required for cloud-hosted MySQL (Aiven)
connect_args = {
    "ssl": {"check_hostname": False}
}

engine = create_engine(
    clean_url,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
