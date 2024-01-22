#!/bin/bash
cd /home/pc17-dpl/travelroad_express
   git add .
   git commit -m "Changes"
   git push

ssh dimas@dimas.arkania.es "
  cd /home/dimas/travelroad_express
  git pull
  npm install
  pm2 restart travelroad_express --update-env
"
