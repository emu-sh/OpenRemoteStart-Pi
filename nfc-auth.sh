#!/bin/bash
UID="your UID here"
while [ 1 ]; do
	sudo bash /home/pi/libnfc-1.7.1/examples/nfc-poll |
	while read; do
	  if echo "$REPLY" | fgrep "$UID"; then
		echo "welcome"
	  fi
	  echo "$REPLY"
	done
done
