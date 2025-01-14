import pyautogui
import time
import sys
import json
import logging


import asyncio
from websockets.asyncio.server import serve

logging.basicConfig(filename="ctl-server.log", filemode='a',
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

async def echo(websocket):
    async for message in websocket:
        try:
            msg = json.loads(message)
            event_type = msg.get('eventType')
            if event_type == "click":
                x = msg.get('x')
                y = msg.get('y')
                if x is not None and y is not None:
                    print(f"Click event at ({x}, {y})")
                    pyautogui.moveTo(x, y)
                    pyautogui.click()
            elif event_type == "keyDown":
                key_event = msg.get('keyEvent', {})
                key = key_event.get('key')
                # {"eventType":"keyDown","keyEvent":{"code":"MetaLeft","ctrlKey":false,"shiftKey":false,"which":91,"key":"Meta","keyCode":91,"type":"keydown"}}
                if key:
                    print(f"KeyDown event for key: {key}")
                    pyautogui.keyDown("ww")  # Simulate a key press

            else:
                print(f"Unknown eventType: {event_type}")
        except e:
            print(e)
        await websocket.send(message)


async def main(PORT):
    log(f"ctl server running at {PORT}")
    async with serve(echo, "localhost", PORT) as server:
        await server.serve_forever()

PORT = 8888

if len(sys.argv) > 2:
    try:
        PORT = int(sys.argv[2])
    except ValueError:
        log("Invalid port number. Using default port "+ str(PORT))
print(1)
if __name__ == "__main__":
    print(2)
    asyncio.run(main(PORT))
