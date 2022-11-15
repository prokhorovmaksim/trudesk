#!/bin/bash

docker rmi trudesk

previous_line=""
image_id=''
while read CMD; do
    echo $CMD
    if echo $CMD | grep -q 'FROM trudesk-preimage:latest'; then
        image_id=${previous_line:5}
    else
        previous_line=$CMD
    fi
done < <(docker build -t trudesk -f Dockerfile-rebuild .)

docker rmi $image_id