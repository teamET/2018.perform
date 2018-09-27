source /root/.bash_profile

cd 2018.perform

mes(){
    curl -X POST --data-urlencode "payload={\"channel\": \"#bot\", \"username\": \"webhookbot\", \"text\": \"$1\", \"icon_emoji\": \":sunglasses:\"}" $WEBHOOK_URL
}
mes "This is posted to #bot and comes from a bot named webhookbot.\n http://$(hostname -I|cut -f1 -d' ')\n \`$(whoami)@$(hostname -I|cut -f1 -d' ')\`\n\`$(pwd)\`\n\`\`\`$(ls -al)\`\`\`\ "
# hexo
cd static
hexo --version
mes hexo generate

# bot
cd /root/2018.perform/bot
npm install
