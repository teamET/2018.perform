source /root/.bash_profile

function start_forever(){
    echo start process $1 , $2
    cd $1
    npm install
    forever restart $2 --minUptime 1000 --spinSleepTime 1000 || \
        forever restart $2 --minUptime 1000 --spinSleepTime 1000 && forever list)
}

function mes(){
    echo $1
    curl -X POST --data-urlencode \
    "payload={\"channel\": \"#server_log\", \"username\": \"webhookbot\", \"text\": \"\`\`\` $1 \`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL
}

hexo --version
npm --version
node --version

# hexo
cd /root/2018.perform/static
npm install --save hexo-cli
hexo generate --force --bail
cp -rf ./public/* /var/www/public
echo "{'test':'test'}" > /var/www/public/data/test.json  #/var/www/public/data should be directory



start_forever /root/2018.perform/bot/ bot.js
start_forever /root/2018.perform/api-server/ bin/www


curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

curl -X POST --data-urlencode "payload={\"channel\": \"#server_log\", \"username\": \"webhookbot\", \"text\": \"\`\`\`$(cd /var/www/public ;find .|sort)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

mes "hello slack func"
