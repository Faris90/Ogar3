###### Source: https://github.com/issy123/agario-protocol/issues/19

### **1) Cell Update message 0x10**

string = utf8 null-terminated string

A little change in the structure of cell update message:

| Offset | Type        | Description
|--------|-------------|------------
| 0      | byte        | Packet ID (16)
| 1      | uint16      | Eat Record Count
| 3      | record list | Eat Records
| xx     | record list | Cell Update Records. Ends with 4-zero bytes
| xx     | uint16      | Remove Record Count
| xx     | record list | Remove Records

Structure of Eat Record:

| Offset | Type   | Description
|--------|--------|------------
| 0      | uint32 | Hunter Cell Id
| 4      | uint32 | Prey Cell Id

Structure of Cell Update Record:

| Offset | Type   | Description
|--------|--------|------------
| 0      | uint32 | Cell ID (0x00000000 is used as terminator)
| 4      | int32  | Coordinate X
| 8      | int32  | Coordinate Y
| 12     | uint16 | Cell size
| 14     | byte   | Flags
| xx     | byte   | (optional) Extended Flags (Present when bit 7 of Flags is set to 1)
| xx     | 3 byte | (optional) Color (r,g,b components)
| xx     | string | (optional) Skin name (zts, utf8 or utf16?)
| xx     | string | (optional) Cell name
| xx     | uint32 | (optional) PlayerId - it is resent when bit isPlayerIdPresent of Extended Flags is set to 1. It contains player ID (do not confuse with cell ID, this is player ID)

Structure of Remove Record:

| Offset | Type   | Description
|--------|--------|------------
| 0      | uint32 | Cell ID (which should be removed)

The Flags:

| Offset | Hex Mask | Description |
|--------|----------| --- |
| 0x01   | isVirus
| 0x02   | isColorPresent (3 bytes with R,G,B components included into update)
| 0x04   | isSkinPresent (zero terminated string with skin name included into update)
| 3      | 0x08     | isNamePresent (zero terminated string with skin name included into update, UTF8 encoding)
| 4      | 0x10     | isAgitated (if 1 then increases the amplitude of the waves on a blob outline)
| 5      | 0x20     | isEject  (if 1 then this is not a player cell, just W ejected blob)
| 6      | 0x40     | isEjectEnemy (if 1 then this is W ejected blob, but it's set to 0 for self ejected blobs)
| 7      | 0x80     | isExtendedFlags  (if 1 then Extended Flags field is present)

The Extended Flags:

| Bit | Hex Mask | Description
|-----|----------|------------
| 0   | 0x01     | isPellet (if 1 then this is pellet cell)
| 1   | 0x02     |
| 2   | 0x04     | isPlayerIdPresent (if 1 then PlayerId field is present in the record)
| 3   | 0x08     |
| 4   | 0x10     |
| 5   | 0x20     |
| 6   | 0x40     |
| 7   | 0x80     |

### 2) Leaderboard FFA message

| Offset | Type | Description |
|--------|------|-------------|
| 0      | byte | Packet ID (53) |
| 3      | record list | FFA Records |

### 3) Leaderboard FFA teams message 0x36

| Offset | Type        | Description
|--------|-------------|------------
| 0      | byte        | Packet ID (54)
| 1      | uint16      | ?? probably the count of facebook friends
| 3      | record list | FFA Records


The structure of FFA Record is the following:

| Offset | Type     | Description 
|--------|----------|------------
| 0      | byte     | RecordFlags
| xx     | string   | (optional) Cell Name (present when isNamePresent is set)
| xx     | uint32   | (optional) Player ID (present when isPlayerIdPresent is set)


RecordFlags description:

| Bit | Hex Mask | Description
|-----|----------|------------
| 0   | 0x01     | (not used) ?probably isOrderPresent?
| 1   | 0x02     | (optional) isNamePresent
| 2   | 0x04     | (optional) isPlayerIdPresent (usually appears with isNamePresent)
| 3   | 0x08     | (optional) isMe (usually appears without isNamePresent and without isPlayerIdPresent, because it's already known for the client)
| 4   | 0x10     | (optional) ?probably isFriend?
| 5   | 0x20     |
| 6   | 0x40     |
| 7   | 0x80     |
