import os
from fastapi import FastAPI
from api.chat import router as chat_router
from api.core.logging import setup_logging
from fastapi.middleware.cors import CORSMiddleware

setup_logging()
app = FastAPI(
    title="Agent API",
    version="1.0.0"
)
origins = [
    "http://127.0.0.1:3000", 
    "http://localhost:3000",
    "http://localhost:3001",
    "http://frontend:3000",
    "http://gitscope-frontend:3000",
    "http://127.0.0.1:8001",
    "http://localhost:8001",
    "http://backend:8001",
    "http://gitscope-backend:8001",
]

# Allow all origins in Docker for development
if os.getenv("DOCKER_CONTAINER") == "true":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)




app.include_router(chat_router)


@app.get("/health")
def health():
    return {"status":"ok"}

@app.get("/debug/env")
def debug_env():
    return {
        "github_token_set": bool(os.getenv("GITHUB_TOKEN")),
        "groq_api_key_set": bool(os.getenv("GROQ_API_KEY")),
        "docker_container": os.getenv("DOCKER_CONTAINER"),
    }