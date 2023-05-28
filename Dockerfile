FROM ubuntu:20.04
RUN apt update

ENV NODE_VERSION=16.13.0
RUN apt install -y curl nginx ffmpeg
RUN /etc/init.d/nginx start
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN apt install -y python3 python3-pip

RUN pip install Django gunicorn django-cors-headers djangorestframework pymongo bcrypt PyJWT soundfile numpy requests
RUN npm install pm2@latest -g

RUN mkdir codebase

COPY serve_client codebase/client
COPY client/build codebase/client/build
COPY server codebase/server
COPY streamer codebase/streamer
COPY test /etc/nginx/sites-available
COPY nginx.conf /etc/nginx

RUN ln -s /etc/nginx/sites-available/test /etc/nginx/sites-enabled/


RUN cd /codebase/client && npm i
RUN cd /codebase/streamer && npm i

EXPOSE 3002

CMD /etc/init.d/nginx restart && cd /codebase/streamer && pm2 start main.js && cd /codebase/client && pm2 start main.js && cd /codebase/server && gunicorn --bind 0.0.0.0:8000 server.wsgi