mkdir -p /etc/ssl/private /etc/ssl/certs
openssl dhparam -out /etc/ssl/private/dhparams.pem 2048

# selfsigned ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/selfsigned.key -out /etc/ssl/certs/selfsigned.crt 

echo "now edit nginx congifs"
