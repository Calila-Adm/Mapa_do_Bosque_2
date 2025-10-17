# Use Python 3.12 slim image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies (including PostgreSQL client libraries)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml first for dependency installation
COPY pyproject.toml README.md ./

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install \
    django>=5.2.7 \
    python-dotenv>=1.0.0 \
    pandas>=2.3.3 \
    numpy>=2.3.3 \
    gunicorn>=21.2.0 \
    djangorestframework>=3.16.1 \
    django-cors-headers>=4.9.0 \
    django-filter>=25.2 \
    dj-database-url>=3.0.1 \
    psycopg2-binary>=2.9.11

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p /app/.secrets

# Collect static files (ignore errors if settings not ready)
RUN python manage.py collectstatic --noinput || true

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD python manage.py migrate && \
    python manage.py runserver 0.0.0.0:8000
