FROM node:latest

ENV APPSERVER_DIR /tmp/apiserver
COPY ./ $APPSERVER_DIR
WORKDIR $APPSERVER_DIR
RUN apt-get update&& apt-get install -y wget vim git &&npm install
EXPOSE 3000

CMD ["npm","start"]

