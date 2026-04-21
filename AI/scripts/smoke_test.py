from fastapi.testclient import TestClient

from app.main import app

if __name__ == "__main__":
    client = TestClient(app)

    print("GET / ->", client.get("/").json())
    print("GET /api/v1/health ->", client.get("/api/v1/health").json())
    print(
        "POST /api/v1/rag/query ->",
        client.post(
            "/api/v1/rag/query",
            json={"question": "NovaGear là gì?", "context": ["microservices", "React"], "top_k": 3},
        ).json(),
    )
    print(
        "POST /api/v1/search/suggest ->",
        client.post("/api/v1/search/suggest", json={"query": "laptop AI", "limit": 3}).json(),
    )
    print(
        "POST /api/v1/search/semantic ->",
        client.post("/api/v1/search/semantic", json={"query": "tai nghe 3D", "limit": 3}).json(),
    )
