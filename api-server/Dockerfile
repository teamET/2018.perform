FROM node:alpine

ENV APPSERVER_DIR /tmp/apiserver
COPY ./ $APPSERVER_DIR
WORKDIR $APPSERVER_DIR
RUN npm install
EXPOSE 3000

CMD ["npm","start"]

