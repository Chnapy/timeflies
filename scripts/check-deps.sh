#!/bin/bash

if [ $OSTYPE == msys ]; 
then 
    echo "Check dependencies not available on Windows env.";
else
    # @yarnpkg/doctor is broken in 3.0.0-rc.2 so we use the last version which worked
    yarn dlx @yarnpkg/doctor@2.1.3 $INIT_CWD
fi
