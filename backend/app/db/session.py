from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

from sqlalchemy.engine import URL

engine_url = URL.create(
    drivername="oracle+oracledb",
    username=settings.DB_USER,
    password=settings.DB_PASSWORD,
    host=settings.DB_DSN.split(":")[0],
    port=int(settings.DB_DSN.split(":")[1].split("/")[0]),
    query={"service_name": settings.DB_DSN.split("/")[1]}
)
engine = create_engine(engine_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
