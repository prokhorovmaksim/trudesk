#!/bin/bash

docker build -t trudesk-preconfig -f Dockerfile-preconfig .
docker build -t trudesk-preimage -f Dockerfile-preimage .

previous_line=""
image_id=''
while read CMD; do
    if echo $CMD | grep -q 'FROM trudesk-preimage:latest'; then
        image_id=${previous_line:5}
    else
        previous_line=$CMD
    fi
done < <(docker build -t trudesk -f Dockerfile-rebuild .)

docker rmi $image_id