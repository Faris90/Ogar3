# Modern Protocol revision 3

# Type definition

| Type    | Description |
| ------- | ----------- |
| boolean | Unsigned 8-bit integer where 0 is false and 1 is true |
| uint8   | Unsigned 8-bit integer |
| int8    | Signed 8-bit integer |
| uint16  | Unsigned 16-bit integer |
| int16   | Signed 16-bit integer |
| uint24  | Unsigned 24-bit integer |
| int24   | Signed 24-bit integer |
| uint32  | Unsigned 32-bit integer |
| int32   | Signed 32-bit integer |
| float32 | Single-precision IEEE-754 floating point |
| float64 | Double-precision IEEE-754 floating point |
| string  | UTF-8 null-terminated string |
| struct  | An object defined further in the specification |

All raw multi-byte data types are in little endian.

Types in an array (i.e. `string[]`) are repeated in binary form but will always have a way of terminating - be it a length given earlier or termination when an integer inside a `struct` becomes zero.

# Client -> Server

## 0x01 Protocol version

Sent at connection start.

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Message opcode (`0x01`) |
| 1     | uint32    |        | Revision (`0x00000003`) |

## 0x02 Ping

Sent whenever the client wants to measure round-trip delay time.

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Message opcode (`0x02`) |

## 0x03 Update

Sent 25 times per second.

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Message opcode (`0x03`) |
| 1     | int32     |        | Mouse position X |
| 5     | int32     |        | Mouse position Y |
| 9     | uint8     |        | Amount of split requests (Space presses) |
| 10    | uint8     |        | Amount of minion split requests (E presses) |
| 11    | uint8     |        | Control flags |
| 12-?  | string    | **NC** | Spawning name |
| ?     | struct    | **CC** | Chat messages |

### Control flags

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 1       | `0x01`      | **NC** | Spawning name present (spawn request) |
| 2       | `0x02`      |        | Spectate request |
| 4       | `0x04`      |        | Action (Q) press |
| 8       | `0x08`      |        | Action (Q) release |
| 16      | `0x10`      |        | Eject mass request (W press) |
| 32      | `0x20`      |        | Minion eject mass request (R press) |
| 64      | `0x40`      |        | Minion freeze request (T press) |
| 128     | `0x80`      | **CC** | Send chat message request |

### Chat messages

| Index | Type      | Flag | Description |
| ----- | --------- | ---- | ----------- |
| 0     | uint8     |      | Chat message count |
| 1-?   | string[]  |      | The messages |


# Server -> Client

## 0x02 Pong

Sent as a response to a **0x02 Ping**.

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Message opcode (`0x02`) |

## 0x03 Update

Sent 25 times per second by default. If nothing is updated in a tick, this message may be omitted.

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Message opcode (`0x03`) |
| 1     | uint16    |        | Global update flags |
| 3?    | struct    | **SO** | Spectate view area |
| ?     | struct    | **WO** | World border |
| ?     | struct    | **SI** | Server information |
| ?     | struct    | **WI** | World information |
| ?     | struct    | **CD** | Incoming chat messages |
| ?     | struct    | **LD** | Leaderboard data |
| ?     | struct[]  | **AC** | Added cells |
| ?     | struct[]  | **UC** | Updated cells |
| ?     | struct[]  | **EC** | Eaten cells |
| ?     | struct[]  | **RC** | Removed cells |


### Global update flags

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 1       | `0x0001`    | **SO** | Spectate view area present |
| 2       | `0x0002`    | **WO** | World border present |
| 4       | `0x0004`    | **SI** | Server information present |
| 8       | `0x0008`    | **WI** | World information present |
| 16      | `0x0010`    | **CD** | Incoming chat messages present |
| 32      | `0x0020`    | **LD** | Leaderboard data present |
| 64      | `0x0040`    |        | Clear visible cells and leaderboard |
| 128     | `0x0080`    | **AC** | Added cells present |
| 256     | `0x0100`    | **UC** | Updated cells present |
| 512     | `0x0200`    | **EC** | Eaten cells present |
| 1024    | `0x0400`    | **RC** | Removed cells present |

### Spectate view area

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | float32   |        | View area center X |
| 4     | float32   |        | View area center Y |
| 8     | float32   |        | View area scale |

### World border

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | float32   |        | Left bound |
| 4     | float32   |        | Right bound |
| 8     | float32   |        | Top bound |
| 12    | float32   |        | Bottom bound |

### Server information

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Server gamemode type |
| 1     | uint8     |        | Server version (major) |
| 2     | uint8     |        | Server version (minor) |
| 3     | uint8     |        | Server version (patch) |

#### Server gamemode type

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 0       | `0x00`      |        | FFA-like |
| 1       | `0x01`      |        | Teams-like |

### World information

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0-?   | string    |        | Server name |
| ?-?   | string    |        | Server gamemode name |
| ?     | float32   |        | Server load time (0 - 1) |
| ?     | uint32    |        | Server uptime (seconds) |
| ?     | uint16    |        | External players (connections) |
| ?     | uint16    |        | Internal players (bots) |
| ?     | uint16    |        | Alive players |
| ?     | uint16    |        | Spectating / roaming players |

### Incoming chat messages

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint16    |        | Chat message count |
| 2-?   | struct[]  |        | Chat message |

#### Chat message

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0-?   | string    |        | Source name |
| ?     | uint8     |        | Source color R |
| ?     | uint8     |        | Source color G |
| ?     | uint8     |        | Source color B |
| ?     | boolean   |        | Is server |
| ?     | string    |        | Message content |

### Leaderboard data

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint8     |        | Leaderboard type |
| 1-?   | struct[]  | **L1** | FFA board data |
| 1-?   | struct    | **L2** | Pie chart data |
| 1-?   | struct    | **L3** | Text board data |

#### Leaderboard type

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 1       | `0x01`      | **L1** | FFA board |
| 2       | `0x02`      | **L2** | Pie chart |
| 3       | `0x03`      | **L3** | Text board |

#### FFA board data

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint16    |        | Item position **Terminates array if `0x0000`** |
| 1     | uint8     |        | Item flags |
| 2-?   | string    |        | Item name |

##### Item flags

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 1       | `0x01`      |        | Is highlighted |
| 2       | `0x02`      |        | Is me |

#### Pie chart data

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint16    |        | Length |
| 2     | float32[] |        | Item size (0 - 1) |

#### Text board data

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint16    |        | Length |
| 2     | string[]  |        | Item text |

### Added cells

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint32    |        | ID **Terminates array if `0x00000000`** |
| 4     | uint8     |        | Cell type |
| 5     | float32   |        | Cell position X |
| 9     | float32   |        | Cell position Y |
| 16    | uint16    |        | Cell size |
| 18    | uint8     |        | Cell color R |
| 19    | uint8     |        | Cell color G |
| 20    | uint8     |        | Cell color B |
| 21    | uint8     |        | Additional info flags |
| 22-?  | string    | **HN** | Cell name |
| ?-?   | string    | **HS** | Cell skin |

#### Cell type

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 0       | `0x00`      |        | Player cell |
| 1       | `0x01`      |        | Pellet |
| 2       | `0x02`      |        | Virus |
| 3       | `0x03`      |        | Ejected cell |
| 4       | `0x04`      |        | Mothercell |

#### Additional info flags

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 1       | `0x01`      |        | Is owned |
| 2       | `0x02`      | **HN** | Cell name present |
| 4       | `0x04`      | **HS** | Cell skin present |

### Updated cells

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint32    |        | ID **Terminates array if `0x00000000`** |
| 1     | uint8     |        | Updated info flags |
| 2?    | float32   | **HP** | Cell position X |
| 6?    | float32   | **HP** | Cell position Y |
| ?     | uint16    | **HZ** | Cell size |
| ?     | uint8     | **HC** | Cell color R |
| ?     | uint8     | **HC** | Cell color G |
| ?     | uint8     | **HC** | Cell color B |
| ?-?   | string    | **HN** | Cell name |
| ?-?   | string    | **HS** | Cell skin |

#### Updated info flags

| Decimal | Hexadecimal | Flag   | Description |
| ------- | ----------- | ------ | ----------- |
| 1       | `0x01`      | **HP** | Position present |
| 2       | `0x02`      | **HZ** | Size present |
| 4       | `0x04`      | **HC** | Color present |
| 8       | `0x08`      | **HN** | Name present |
| 16      | `0x10`      | **HS** | Skin present |

### Eaten cells

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint32    |        | Killed ID **Terminates array if `0x00000000`** |
| 4     | uint32    |        | Killer ID |

### Removed cells

| Index | Type      | Flag   | Description |
| ----- | --------- | ------ | ----------- |
| 0     | uint32    |        | ID **Terminates array if `0x00000000`** |

# Update history

### Revision 3 @ 2019-06-03

- Positions (view area, world bounds, cell position) are now defined by float32 rather than int32

### Revision 2 @ 2018-11-12

- Moved flags AC, UC, EC, RC by one bit
- Added the `Clear visible cells and leaderboard` flag

### Revision 1 @ 2018-08-25

- Initial
