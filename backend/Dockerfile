FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y libgl1 libglib2.0-0 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --default-timeout=1000 -r requirements.txt
RUN pip install email-validator "bcrypt<4.0.0"

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]