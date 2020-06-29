import asyncio
import json
import logging
import websockets
from bluff_python import bluff

logging.basicConfig()

STATE = {"value": 0}

USERS = set()


def state_event():
    return json.dumps({"type": "state", **STATE})


def users_event():
    return json.dumps({"type": "users", "count": len(USERS)})


async def notify_state():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = state_event()
        await asyncio.wait([user.send(message) for user in USERS])


async def notify_users():
    if USERS:  # asyncio.wait doesn't accept an empty list
        message = users_event()
        await asyncio.wait([user.send(message) for user in USERS])


async def register(websocket):
    USERS.add(websocket)
    print("=========> {}".format(websocket))
    await notify_users()


async def unregister(websocket):
    USERS.remove(websocket)
    await notify_users()

async def send_cards_to_client(card_to_be_distri_to_players):
	try:
	    await asyncio.wait([user.send(json.dumps(card_to_be_distri_to_players)) for user in USERS])
	finally:
		print("hello2")

async def throw_cards(data,bluffw):
    print("throw card calledd")
    userName=data["userName"]
    if userName=="":
        userName=data["playerNumber"]
    bluffw.last_player_throw_record = data["playerNumber"]
    bluffw.last_player_name_throw_record = userName
    for k in data["thrown_cards"]:
        print("thrown cards {}".format(k))
    result=bluffw.throw_cards(data["playerNumber"],data["thrown_cards"],data["claiming"],data["userName"])
    await send_cards_to_client(result)
    #print("result from tx bluff {}".format(result))   
	
async def pick_cards(data,bluffw):
    result=bluffw.pick_cards_from_mat(data["playerNumber"],data["userName"])
    #print("pick_cards card calledd {}".format(result))
    await send_cards_to_client(result)


async def counter(websocket, path):
    global bluffw
    # register(websocket) sends user_event() to websocket
    await register(websocket)
    try:
        await websocket.send(state_event())
        async for message in websocket:
            data = json.loads(message)
            print("messagggggeeeeeeeeeeee=====> {}".format(data))
            if data["action"] == "minus":
                STATE["value"] -= 1
                await notify_state()
            elif data["action"] == "plus" and data["userType"]=="admin":
                bluffw = bluff(len(USERS))
                STATE["value"] += 1
                await distribute_cards(bluffw)
                await notify_state()
            elif data["action"] == "throw_card":
                await throw_cards(data,bluffw)
            elif data["action"] == "pick_cards":
                await pick_cards(data,bluffw)

            else:
                logging.error("unsupported event: {}".format(data))
                #print("data------------> {}".format(data))
    finally:
        print("hello")
        #await unregister(websocket)


		#await unregister(websocket)


	
async def distribute_cards(bluffw):
    no_of_deck=1
    bluffw.shuffle_cards_fn(no_of_deck)
    get_card_distribution_to_player = bluffw.card_distribution_to_player()
    await send_cards_to_client(get_card_distribution_to_player)


start_server = websockets.serve(counter, port=1234)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()