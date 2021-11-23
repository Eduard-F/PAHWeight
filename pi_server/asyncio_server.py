# python 3.7+
# pip3 install asyncio
import socket
import asyncio
import select

class SocketHandler():
    def __init__(self, conn):
        self.conn = conn
        self.run_loop = False

    async def recv_loop(self):
        try:
            print('client connected')
            while True:
                cmd = self.conn.recv(1024)  # receive data from client
                cmd = cmd.decode()
                print(cmd)
                if len(cmd) == 0:
                    break
                elif cmd == "startLoop":
                    self.run_loop = True
                    task2 = asyncio.create_task(self.whileLoop())
                    task3 = asyncio.create_task(test_counter())
                    await task2
                    await task3
                elif cmd == "endLoop":
                    self.run_loop = False
        finally:
            self.conn.close()

    async def whileLoop(self):
        count = 0
        conn = self.conn
        while self.run_loop:
            inReady, outReady, exReady = select.select([conn], [], [], 0.0)
            if (conn in inReady):
                print('more data has arrived at the TCP socket, returning from Loop_()')
                break
            print('self.run_loop: ' + str(self.run_loop))
            # the below line should allow for other processes to run however
            # 'cmd = self.conn.recv(1024)' only runs after the while loop breaks
            await asyncio.sleep(1)

            # break the loop manually after 10 seconds
            count += 1
            if count > 5:
                break

async def test_counter():
# just a dummy async function to see if the whileLoop func
# allows other programs to run
    for k in range(5):
        print(str(k))
        await asyncio.sleep(1)

async def main():
    # this is the main asyncio loop that initializes the socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    # sock.setblocking(False)

    # Bind the socket to the address given on the command line
    server_address = ("127.0.0.1", 22000)
    print('starting up on %s port %s' % server_address)
    sock.bind(server_address)
    sock.listen(1)
    while True:
        print('waiting for a connection')
        connection, client_address = sock.accept()
        socketHandler = SocketHandler(connection)
        task1 = asyncio.create_task(socketHandler.recv_loop())  # create recv_loop as a new asyncio task
        await task1

if __name__ == '__main__':
    asyncio.run(main())