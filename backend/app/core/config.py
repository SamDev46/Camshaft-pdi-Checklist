from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_USER: str = "system"
    DB_PASSWORD: str = "oracle"
    DB_DSN: str = "localhost:1521/XEPDB1"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    SECRET_KEY: str = "cummins_secret_key_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    class Config:
        env_file = ".env"

settings = Settings()
