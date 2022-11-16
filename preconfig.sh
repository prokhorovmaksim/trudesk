#!/bin/bash

docker build -t trudesk-preconfig -f Dockerfile-preconfig .
docker build -t trudesk-preimage -f Dockerfile-preimage .
