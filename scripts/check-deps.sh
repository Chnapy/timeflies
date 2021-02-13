#!/bin/bash

if [ $OSTYPE == msys ]; 
then 
    echo "Check dependencies not available on Windows env.";
else
    yarn dlx @yarnpkg/doctor $INIT_CWD
fi
