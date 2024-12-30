#!/bin/bash

gnome-terminal -- bash -c "npm run server; exec bash"

gnome-terminal -- bash -c "npm start; exec bash"
