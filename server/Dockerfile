FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# We will mount the source code in docker-compose, but copying here is good for prod builds
COPY ./src .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
