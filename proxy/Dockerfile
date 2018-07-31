
FROM nginx

COPY ./kefs.conf /etc/nginx/sites-enabled/
RUN ln -s /etc/nginx/sites-enabled/kefs.conf /etc/nginx/sites-available/kefs.conf 

RUN apt-get update && apt-get install -y vim curl iputils-ping 
RUN mkdir /root/logs
RUN chmod 755 -R /root

#CMD nginx -g daemon off;
CMD ["/usr/sbin/nginx","-g","daemon off;"]
