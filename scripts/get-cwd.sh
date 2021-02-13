#!/bin/bash

# if Windows, need a small workaround
if [ $OSTYPE == msys ]; 
then 
    echo .\"$INIT_CWD\"; 
else 
    echo $INIT_CWD; 
fi
