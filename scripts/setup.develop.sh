source $HOME/.bash_profile

function mes(){
    echo $1,$2
    curl -X POST --data-urlencode \
    "payload={\"channel\": $1, \"username\": \"webhookbot\", \"text\": \"$2\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL
}

hexo --version
npm --version
node --version

# hexo
cd $HOME/static
npm install --save hexo-cli
hexo generate --force --bail
\cp -rf ./public/* /var/www/public
echo "{'test':'test'}" > /var/www/public/data/test.json  #/var/www/public/data should be directory

mes \"#bot\" "development"
mes \"#bot\" "http://$(curl ifconfig.io)\n \`$(whoami)@$(curl ifconfig.io)\`"
mes \"#server_log\" "\`\`\`$(cd /var/www/public ;find .|sort)\`\`\`"
