#!/usr/bin/expect -f
 
set timeout -1
 
spawn ./aws_configure.sh

expect "AWS Access Key ID"

send -- "<Your Access Key ID>\r"

expect "AWS Secret Access Key"

send -- "<Your Secret Access Key ID>\r"

expect "Default region name"

send -- "us-east-2\r"

expect "Default output format"

send -- "json\r"

exit 0