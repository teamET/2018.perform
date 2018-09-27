source /root/.bash_profile
hexo --version
npm --version
node --version

# hexo
cd /root/2018.perform/static
hexo --version
npm install --save hexo-cli
hexo generate

# bot
cd /root/2018.perform/bot
npm install

curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\`$(pwd)\`\n\`\`\`$(find /var/www/public)\`\`\`\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL


