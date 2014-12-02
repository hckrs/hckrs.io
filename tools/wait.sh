#!/bin/sh

while ! hckrs alive; do
  echo "wait for meteor"
  sleep 1 
done

echo "meteor alive!"