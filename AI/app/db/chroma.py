import chromadb
from app.core.config import get_settings

settings = get_settings()

def get_chroma_client():
    # Use a persistent client pointing to /app/data/chroma
    # We can default to a local path for dev
    db_path = "./data/chroma" if settings.app_env.lower() != "production" else "/app/data/chroma"
    return chromadb.PersistentClient(path=db_path)

def get_catalog_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(name="catalog_products")
