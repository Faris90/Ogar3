# Client -> Server

# Server -> Client

## Added in protocol 18 (Battle Royale)

string = utf8 null-terminated string

### Game starting
| Offset | Type   | Info
|--------|--------|-----
| 0      | uint8  | Packet ID (176)
| 1      | uint32 | Time to start

### Start Game
| Offset | Type  | Info
|--------|-------|-----
| 0      | uint8 | Packet ID (177)

### Update Game
| Offset | Type   | Info
|--------|--------|-----
| 0      | uint8  | Packet ID (178)
| 1      | uint16 | Players alive
| 3      | uint16 | Game status

#### Read game status (Type 0: waiting for players) 

#### Read game status (Type 1: survive!) 
| Offset | Type   | Info
|--------|--------|-----
| 5      | uint8  | Phase (0)
| 6      | int32  | Red zone X
| 10     | int32  | Red zone Y
| 14	   | uint32 | Red zone radius
| 18	   | uint32 | Shrink time (0)

#### Read game status (Type 2)
| Offset | Type   | Info
|--------|--------|-----
| 5      | uint8  | Phase (1: safe area shrinking in x, 2: go to safe area)
| 6      | int32  | Red zone X
| 10     | int32  | Red zone Y
| 14	   | uint32 | Red zone radius
| 18	   | uint32 | Shrink time
| 22     | int32  | Target zone X
| 26     | int32  | Target zone Y
| 30	   | uint32 | Target zone radius

### Player death
| Offset | Type  | Info
|--------|-------|-----
| 0      | uint8 | Packet ID (179)
| 1      | uint8 | Death type

##### Death types:
| Type | Description
|------|------------
| 0    | player ate player
| 1    | player eaten by virus
| 2    | player could not get away
| 3    | player died

All types but `0` have 1 field with a string of the killed nickname (type 0 has 1 more, killer nickname)

### Battle result
| Offset | Type   | Info
|--------|--------|-----
| 0      | uint8  | Packet ID (180)
| 1      | uint32 | Final position
| 5      | uint32 | Total kills
| 7      | uint16 | Player count (read below while (playerCount--))
| ?      | string | Player nickname
| ?      | uint32 | Player position

## Added in protocol 19 (Minimap)
[Click here](https://github.com/issy123/agario-protocol/issues/22)

## Changed in protocol 20
Set Border no longer has server version, it has been moved to Cipher Key (241)
