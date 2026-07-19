from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    ADMIN_USERNAME: str = ""
    ADMIN_PASSWORD: str = ""

    GCS_BUCKET_NAME: str
    GCS_PUBLIC_URL: str

    RESEND_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()