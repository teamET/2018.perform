source /root/.bash_profile
hexo --version
npm --version
node --version

# hexo
cd /root/2018.perform/static
hexo --version
npm install --save hexo-cli
hexo generate
cp -rf ./public/* /var/www/public
echo "{'test':'test'}" > /var/www/public/data/test.json  #/var/www/public/data should be directory

# bot
cd /root/2018.perform/bot
npm install
[[ forever list |grep bot.js  ]] && forever start --minUptime 1000 --spinSleepTime 1000 /root/2018.perform/bot/bot.js

#api-server
cd /root/2018.perform/api-server
npm install
[[ forever list |grep api-server  ]] && forever start --minUptime 1000 --spinSleepTime 1000 /root/2018.perform/api-server/bin/www



curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

curl -X POST --data-urlencode "payload={\"channel\": \"#server_log\", \"username\": \"webhookbot\", \"text\": \"\`\`\`$(cd /var/www/public ;find .|sort)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL

