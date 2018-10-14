#!/bin/bash
cd ~/

DATE=`date +%Y%m%d`
NEXT_WAIT_TIME=0
EXIT_CODE=0

command='/usr/local/bin/dropbox-api sync ./public dropbox:/'$DATE' -v'
/usr/local/bin/dropbox-api mkdir $DATE

until $command || [ $NEXT_WAIT_TIME -eq 4 ]; do
    EXIT_CODE=$?
        sleep $NEXT_WAIT_TIME
	let NEXT_WAIT_TIME=NEXT_WAIT_TIME+1
            done
exit $EXIT_CODE
