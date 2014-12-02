#!/bin/sh

# Meteor alive?
curl -s --head http://localhost:3000 | head -n 1 | grep "HTTP/1.[01] [23].." > /dev/null