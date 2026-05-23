from fastapi import FastAPI

app = FastAPI(title="stock-manager-ai")


@app.get('/health')
def health():
    return {"status": "ok"}


@app.post('/analyze')
def analyze(payload: dict):
    # placeholder for model inference
    return {"analysis": "not implemented", "input": payload}
