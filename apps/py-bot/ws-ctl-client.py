import pyautogui
import time
import sys
import json
import logging


import asyncio
from websockets import connect, exceptions

logging.basicConfig(filename="ctl-client.log", filemode='a',
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    level=logging.INFO)


def log(message, level=logging.INFO):
    """
    Log a message to the file.

    :param message: Message to be logged
    :param level: Level of the log (default is INFO)
    """
    print(message)
    if level == logging.CRITICAL:
        logging.critical(message)
    elif level == logging.ERROR:
        logging.error(message)
    elif level == logging.WARNING:
        logging.warning(message)
    elif level == logging.INFO:
        logging.info(message)
    else:
        logging.debug(message)


async def hello():
    while True:
        try:
            url = "ws://localhost:6789"
            async with connect(url) as websocket:
                print(">>>> Connected to WebSocket server: "+url)
                # Send a message
                await websocket.send("Hello world!")
                
                # Wait for a response
                message = await websocket.recv()
                print(f"Received message: {message}")
                # Keep the connection alive (e.g., with a heartbeat)
                while True:
                    try:
                        await asyncio.sleep(10)
                        await websocket.send("ping")  # Example heartbeat message
                        pong = await websocket.recv()
                        print(f"Heartbeat response: {pong}")
                    except exceptions.ConnectionClosed:
                        print("Connection lost during heartbeat.")
                        break
        except (exceptions.ConnectionClosed, OSError) as e:
            # Log the error and attempt to reconnect
            print(f"Connection error: {e}. Retrying in 1 seconds...")
            await asyncio.sleep(1)

if __name__ == "__main__":
    asyncio.run(hello())