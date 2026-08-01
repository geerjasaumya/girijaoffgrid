from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, spaces, posts, media

app = FastAPI(
    title="girijaoffgrid API",
    description="Backend for girijaoffgrid.com",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
        "http://localhost:5173",    # Vite dev server
        "https://girijaoffgrid.com",
        "https://girijaoffgrid.web.app",
        "https://www.girijaoffgrid.com",
    ],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(auth.router)
app.include_router(spaces.router)
app.include_router(media.router)
app.include_router(posts.router)


@app.get("/")
def root():
    return {"message": "girija is going offgrid...!!!"}