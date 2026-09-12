# OmniData AI, ML & Data Engineering Hub Dockerfile
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirement files and install python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy complete project workspace files
COPY . .

# Expose HTTP port 8080
EXPOSE 8080

# Run lightweight HTTP dev server
CMD ["python3", "-m", "http.server", "8080"]
