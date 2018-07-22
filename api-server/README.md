docker build . 
docker run -it -p 8080:3000 $(docker container ls -aq |head -n1) 
