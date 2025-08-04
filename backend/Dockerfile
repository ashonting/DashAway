FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including curl for health checks
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -m nltk.downloader punkt_tab averaged_perceptron_tagger_eng wordnet

# Copy application code
COPY ./app /app/app
COPY ./populate_faqs.py /app/populate_faqs.py

# The .env file will be mounted via docker-compose
EXPOSE 8000

# Optimized uvicorn settings for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log", "--log-level", "info"]
