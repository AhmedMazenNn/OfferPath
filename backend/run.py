"""
run.py - How to Run the Server
=========================

Simple script to start the FastAPI server.

Run with: python run.py
"""

import uvicorn

if __name__ == "__main__":
    # uvicorn is the server
    # app.main:app tells it to look in app/main.py for the FastAPI app
    # --reload restarts automatically when files change
    # --host 0.0.0.0 makes it accessible on network
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=9000,
        reload=True
    )