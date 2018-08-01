
FROM nginx

COPY nginx.conf /etc/nginx/nginx.conf

RUN apt-get update && apt-get install -y vim curl iputils-ping 
RUN mkdir /root/logs
RUN chmod 755 -R /root

#CMD nginx -g daemon off;
#CMD ["/usr/sbin/nginx","-g","daemon off;"]
