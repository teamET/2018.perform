from fluent import sender,event

sender.setup('td.test_db',host='localhost',port=24224)
event.Event('follow',{
    'from':'XXX',
    'to':'YYY'
    })
