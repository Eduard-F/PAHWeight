import time
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1) 
sock.connect(('127.0.0.1', 22000))

sock.sendall(b'startLoop')
time.sleep(2)
sock.sendall(b'endLoop')

sock.close()