#!/usr/bin/perl

print "Status: 302 Found\r\n";
print "Location: /index.html\r\n";
print "Content-Type: text/html\r\n";
print "\r\n";
print "<html><head><title>Redirecting...</title></head>";
print "<body><p>Redirecting to homepage...</p></body></html>";