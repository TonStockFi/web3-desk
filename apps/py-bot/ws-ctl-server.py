import pyautogui
import time
import sys
import json
import logging
import asyncio
import subprocess
import websockets

if sys.platform == "darwin":
    from Quartz import CGWindowListCopyWindowInfo, kCGWindowListOptionOnScreenOnly
elif sys.platform == "win32":
    import pygetwindow as gw
    import win32gui
    import win32con

def activate_window_by_title(title):
    """Activate a window by title on macOS"""
    script = f'tell application "System Events" to set frontmost of (processes whose name contains "{title}") to true'
    subprocess.run(["osascript", "-e", script])

def get_window_info():
    """Retrieve a list of active windows."""
    if sys.platform == "darwin":
        windows = CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, 0)
        return [
            {
                "title": win.get("kCGWindowName", "Unknown"),
                "owner": win.get("kCGWindowOwnerName", "Unknown"),
                "bounds": {
                    "x": int(win["kCGWindowBounds"]["X"]),
                    "y": int(win["kCGWindowBounds"]["Y"]),
                    "width": int(win["kCGWindowBounds"]["Width"]),
                    "height": int(win["kCGWindowBounds"]["Height"])
                } if "kCGWindowBounds" in win else None
            }
            for win in windows if win.get("kCGWindowName")
        ]
    elif sys.platform == "win32":
        return [
            {
                "title": win.title,
                "handle": win._hWnd,
                "bounds": {"x": win.left, "y": win.top, "width": win.width, "height": win.height}
            }
            for win in gw.getAllWindows() if win.title
        ]
    return []

def activate_window(handle):
    """Activate a window by handle (Windows only)."""
    win32gui.SetForegroundWindow(handle)

def move_window(handle, x, y):
    """Move a window to the specified (x, y) position (Windows only)."""
    rect = win32gui.GetWindowRect(handle)  # Get current window size
    width = rect[2] - rect[0]  # Calculate width
    height = rect[3] - rect[1]  # Calculate height
    win32gui.SetWindowPos(handle, win32con.HWND_TOP, x, y, width, height, win32con.SWP_NOZORDER)


async def handle_client(websocket):
    async for message in websocket:
        try:
            msg = json.loads(message)
            event_type = msg.get('eventType')

            if event_type == "dragMove":
                x, y = msg.get('x'), msg.get('y')
                if x is not None and y is not None:
                    print(f"dragMove event at ({x}, {y})")

            elif event_type == "rightClick":
                x, y = msg.get('x'), msg.get('y')
                if x is not None and y is not None:
                    print(f"RightClick event at ({x}, {y})")
                    pyautogui.moveTo(x, y)
                    pyautogui.rightClick()

            elif event_type == "click":
                x, y = msg.get('x'), msg.get('y')
                if x is not None and y is not None:
                    print(f"Click event at ({x}, {y})")
                    pyautogui.moveTo(x, y)
                    pyautogui.click()

            elif event_type == "keyDown":
                key = msg.get('keyEvent', {}).get('key')
                if key:
                    print(f"KeyDown event for key: {key}")
                    pyautogui.keyDown(key)

            elif event_type == "pyautogui":
                script = msg.get('pyAutoGuisScript')
                if script:
                    try:
                        print(f"Executing pyautogui script:\n{script}")
                        exec(script)
                    except Exception as e:
                        print(f"Error executing pyautogui script: {e}")
            elif event_type == "getWindows":
                windows = get_window_info()
                await websocket.send(json.dumps({
                    "action": "onGetWindows",
                    "payload": {"windows": windows}
                }))
            elif event_type == "ctlWin":
                win_name = msg.get('winName', '').lower()
                action = msg.get('action', '').lower()
                windows = get_window_info()
                matching_window = next((win for win in windows if win_name in win.get('title', '').lower()), None)
                if matching_window:
                    print(f"Found Window: {matching_window}")
                    if sys.platform == "win32":
                        if action == 'move':
                            x = msg.get('x', 0)
                            y = msg.get('y', 0)
                            move_window(matching_window['handle'],x,y)
                        if action == 'active':
                            activate_window(matching_window['handle'])
                    else:
                        activate_window_by_title(matching_window['title'])
                else:
                    print("No matching window found!")
            else:
                print(f"Unknown eventType: {event_type}")

        except json.JSONDecodeError:
            print("Invalid JSON received")
        except Exception as e:
            print(f"Error handling message: {e}")

async def main(PORT):
    print(f"WebSocket server running on ws://localhost:{PORT}")
    async with websockets.serve(handle_client, "localhost", PORT):
        await asyncio.Future()  # Run forever

PORT = 6790

if __name__ == "__main__":
    asyncio.run(main(PORT))
