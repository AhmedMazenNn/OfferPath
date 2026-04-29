FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 user

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir --upgrade pip

COPY --chown=user backend/app ./app
COPY --chown=user backend/run.py .

EXPOSE 7860

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]