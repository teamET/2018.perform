# 2018.perform

```
docker-compose build
docker-compose up
```
## then you can view at localhost
##  just do it


1. first youy should copy .envsample to .env then rewrite localhost to address  
` cp .envsample .env `  

### on azure,digitalocean  
```
docker-compose up  
```

then try to access
localhost
localhost/ghost
localhost/api


### on pwd
```
docker run -d --name some-ghost -p 3001:2368 -v /path/to/ghost/blog:/var/lib/ghost ghost:0.11-alpine
```

## without docker-compose  
1. make symlink of nginx configuration files
```
sudo ln -s $(pwd)/proxy/nginx.conf /etc/nginx/nginx.conf  
sudo ln -s $(pwd)/proxy/public /root/public
sudo ln -s $(pwd)/proxy/sites-available /etc/nginx/sites-available  
sudo ln -s /etc/nginx/sites-available /etc/nginx/sites-enabled  
```
2. check requirements  
` nginx -v  `  
if responce is empty [install nginx](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/).  
` ghost -v `  
if responce is empty [install ghost-cli](https://docs.ghost.org/docs/ghost-cli).  

3. run services.(express,ghost,nginx)  
* express  
` cd api-server && npm i  && npm start `  
* ghost  
[run ghost](https://docs.ghost.org/docs/install-local) or `mkdir ghost && docker run -d --name some-ghost -p 2368:2368 -v ./ghost:/var/lib/ghost/content ghost:1 `  
* nginx  
` sudo nginx -s reload `  

4. test services. 
```
#ghost
curl localhost:2368  
#express
curl localhost:3000  
#nginx
curl localhost
curl localhost/ghost
curl localhost/api
curl localhost/booth.html
curl localhost/game.html
```
5. then you can edit files  
top page -> ` ./proxy/public `  
api server -> ` ./api-server/app.js `
