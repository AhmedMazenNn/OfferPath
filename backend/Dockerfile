# Use official Python runtime as a parent image
FROM python:3.11-slim

# Set working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application codebase
COPY app ./app
COPY run.py .

# Expose port (7860 is default for Hugging Face Spaces Docker)
EXPOSE 7860

# Command to run the application (Hugging Face passes 7860 to the container)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
