FROM nvidia/cuda:11.4.3-cudnn8-runtime-ubuntu20.04

RUN apt-get update && apt-get install -y python3 python3-pip

#ARG DEBIAN_FRONTEND=noninteractive

RUN mkdir /app
WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY assets/ assets/
COPY src/* .

CMD [ "python3", "/app/app.py" ]
