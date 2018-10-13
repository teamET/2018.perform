source $HOME/.bash_profile

function start_forever(){
    echo start process $1 , $2
    cd $1
    npm install
    forever restart $2 --minUptime 1000 --spinSleepTime 1000 || \
        (forever start $2 --minUptime 1000 --spinSleepTime 1000 )
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
cd $HOME/2018.perform/static
npm install --save hexo-cli
hexo generate --force --bail
\cp -rf ./public/* /var/www/public
echo "{'test':'test'}" > /var/www/public/data/test.json  #/var/www/public/data should be directory



start_forever $HOME/2018.perform/bot/ bot.js
start_forever $HOME/2018.perform/api-server/ bin/www
forever list


curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n https://$(curl ifconfig.io)\n \`$(whoami)@$(curl ifconfig.io)\`\n\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

curl -X POST --data-urlencode "payload={\"channel\": \"#server_log\", \"username\": \"webhookbot\", \"text\": \"\`\`\`$(cd /var/www/public ;find .|sort)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

mes "hello slack func"
