###### Source: https://github.com/forairan/Agar.io-Protocol/blob/master/Protocol.md

string = null terminated (before 6: utf-16, after + on 6: utf-8) string

# Client -> Server

### Set Nickname (spawns the player)
| Offset | Data Type | Info
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (0)
| 1      | string    | Nickname

### Spectate
| Offset | Data Type | Info
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (1)

### Mouse Move
(1) 4: float64, 5 early: int16, 5 late and 6: int32

| Offset | Data Type            | Info
|--------|----------------------|-----------------
| 0      | uint8                | Packet ID (16)
| ?      | (1)                  | Mouse X
| ?      | (1)                  | Mouse Y
| ?     | uint32               | Node ID of the cell to move (not used anymore).

### Split
| Offset | Data Type | Info
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (17)

### Spectate free roam (Q key pressed)
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (18)

### Q key released
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (19)

### Eject Mass
| Offset | Data Type | Info
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (21)

### (Unoffical) Chat message
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (99)
| 1      | uint8     | Flags? 0
| 2      | string    | The chat message

# Server -> Client

### Update Nodes
(1) before 6: uint32, on + after: uint16

| Offset | Data Type     | Info
|--------|---------------|-----------------
| 0      | uint8         | Packet ID (16)
| 1      | uint16        | Number of nodes to be destroyed
| 2...?  | Destruct Data | Nodes' ID marked for destruction
| ?...?  | Node Data     | Data for all nodes
| ?      | uint32        | Always 0; terminates the node data listing
| ?      | uint16        | Always 0; discarded by the client
| ?      | (1)           | Number of nodes marked for destroying
| ?...?  | Destruct Data | Node ID of each destroyed node (uint32)

### Update Position and Size
Used for spectating.

| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (17)
| 1      | float32   | X position
| 5      | float32   | Y position
| 9      | float32   | Zoom factor of client

### (Protocol > 4) Clear All Nodes
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (18)

### (Protocol > 4 ? Clear My Nodes : Clear Nodes)
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (20)

### Draw Line
Drawn from all player cells to the specified position.

| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (21)
| 1      | uint16    | X position
| 3      | uint16    | Y position

### Add Node
Nodes added by this packet are centered on the client's camera.

| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (32)
| 1      | uint32    | Node ID

### Update Leaderboard (FFA)
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (49)

### Update Leaderboard (Team)
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (50)

### Set Border
(1) only sent first time, (2) ffa = 0, teams = 1, experimental = 4 and party = 8

| Offset | Data Type | Info
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (64)
| 1      | float64   | Left position
| 9      | float64   | Top position
| 17     | float64   | Right position
| 25     | float64   | Bottom position
| 33     | uint32    | (1) (2) gamemode
| 34     | string    | (1) server version

### (Unofficial) Chat Message
| Offset | Data Type | Info
|--------|-----------|-----
| 0      | uint8     | Packet ID (99)
| 1      | uint8     | Flags
| 2-4    | uint8     | RGB color
| 5      | string    | Username
| ?      | string    | The chat message

### Reset Connection 1
Sent at the beginning of a conneciton, before reset connection 2. Server must send Clear Nodes and Set Border packets to keep the client connected.

| Offset | Data Type | Description
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (254)
| 1      | uint32    | Protocol version

### Reset Connection 2
Sent directly after reset connection 1.

| Offset | Data Type | Description
|--------|-----------|-----------------
| 0      | uint8     | Packet ID (255)
| 1      | uint32    | Protocol version
