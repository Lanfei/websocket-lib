## Classes

<dl>
<dt><a href="#Client">Client</a> ⇐ <code>events.EventEmitter</code></dt>
<dd></dd>
<dt><a href="#ClientSession">ClientSession</a> ⇐ <code><a href="#Session">Session</a></code></dt>
<dd></dd>
<dt><a href="#Frame">Frame</a></dt>
<dd></dd>
<dt><a href="#Receiver">Receiver</a> ⇐ <code>stream.Duplex</code></dt>
<dd></dd>
<dt><a href="#Server">Server</a> ⇐ <code>events.EventEmitter</code></dt>
<dd></dd>
<dt><a href="#ServerSession">ServerSession</a> ⇐ <code><a href="#Session">Session</a></code></dt>
<dd></dd>
<dt><a href="#Session">Session</a> ⇐ <code>stream.Duplex</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#createServer">createServer([options], [sessionListener])</a> ⇒ <code><a href="#Server">Server</a></code></dt>
<dd><p>Create a WebSocket Server.</p>
</dd>
<dt><a href="#connect">connect([options], [connectListener])</a> ⇒ <code><a href="#Client">Client</a></code></dt>
<dd><p>Create a connection to the WebSocket Server.</p>
</dd>
</dl>

<a name="Client"></a>

## Client ⇐ <code>events.EventEmitter</code>
**Kind**: global class  
**Extends**: <code>events.EventEmitter</code>  

* [Client](#Client) ⇐ <code>events.EventEmitter</code>
    * [new Client([options], [connectListener])](#new_Client_new)
    * ["connect" (session)](#Client+event_connect)
    * ["error" (error)](#Client+event_error)

<a name="new_Client_new"></a>

### new Client([options], [connectListener])
WebSocket Client


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Number</code> \| <code>String</code> \| <code>Object</code> |  | If options is a string, it will be automatically parsed with url.parse(). |
| [options.host] | <code>String</code> | <code>localhost</code> | A domain name or IP address of the server. |
| [options.port] | <code>Number</code> | <code>80|443</code> | Port of remote server. |
| [options.headers] | <code>Object</code> |  | Headers to be sent to the server. |
| [options.subProtocols] | <code>String</code> \| <code>Array</code> |  | The list of WebSocket sub-protocols. |
| [connectListener] | <code>function</code> |  | A one time listener for the 'connect' event. |

<a name="Client+event_connect"></a>

### "connect" (session)
Emitted when a client session is established.

**Kind**: event emitted by [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| session | [<code>Session</code>](#Session) | The client session. |

<a name="Client+event_error"></a>

### "error" (error)
Emitted when an error occurs.

**Kind**: event emitted by [<code>Client</code>](#Client)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error object. |

<a name="ClientSession"></a>

## ClientSession ⇐ [<code>Session</code>](#Session)
**Kind**: global class  
**Extends**: [<code>Session</code>](#Session)  

* [ClientSession](#ClientSession) ⇐ [<code>Session</code>](#Session)
    * [new ClientSession(request, socket, [head], [client])](#new_ClientSession_new)
    * [.client](#ClientSession+client) : [<code>Client</code>](#Client)
    * [.state](#Session+state) : <code>number</code>
    * [.request](#Session+request) : <code>http.IncomingMessage</code>
    * [.socket](#Session+socket) : <code>net.Socket</code>
    * [.connection](#Session+connection) : <code>net.Socket</code>
    * [.setTimeout(timeout, callback)](#Session+setTimeout) ⇒ [<code>Session</code>](#Session)
    * [.setNoDelay(noDelay)](#Session+setNoDelay) ⇒ [<code>Session</code>](#Session)
    * [.setEncoding(encoding)](#Session+setEncoding) ⇒ [<code>Session</code>](#Session)
    * [.send(data, [binary], [callback])](#Session+send) ⇒ <code>Boolean</code>
    * [.sendText(data, [callback])](#Session+sendText) ⇒ <code>Boolean</code>
    * [.sendBinary(data, [callback])](#Session+sendBinary) ⇒ <code>Boolean</code>
    * [.sendPing([callback])](#Session+sendPing) ⇒ <code>Boolean</code>
    * [.sendPong([callback])](#Session+sendPong) ⇒ <code>Boolean</code>
    * [.sendClose([code], [reason], [callback])](#Session+sendClose) ⇒ <code>Boolean</code>
    * [.sendFrame(frame, [callback])](#Session+sendFrame) ⇒ <code>Boolean</code>
    * [.close([code], [reason])](#Session+close)
    * [.destroy()](#Session+destroy)
    * ["close"](#Session+event_close)
    * ["timeout"](#Session+event_timeout)
    * ["drain"](#Session+event_drain)
    * ["error" (error)](#Session+event_error)
    * ["frame" (frame)](#Session+event_frame)
    * ["end" (code, Reason)](#Session+event_end)
    * ["ping"](#Session+event_ping)
    * ["pong"](#Session+event_pong)
    * ["data" (data)](#Session+event_data)

<a name="new_ClientSession_new"></a>

### new ClientSession(request, socket, [head], [client])
WebSocket Client Session


| Param | Type | Description |
| --- | --- | --- |
| request | <code>IncomingMessage</code> | see [request](#Session+request) |
| socket | <code>Socket</code> | see [socket](#Session+socket) |
| [head] | <code>Buffer</code> | Data that received with headers. |
| [client] | [<code>Client</code>](#Client) | see [client](#ClientSession+client) |

<a name="ClientSession+client"></a>

### clientSession.client : [<code>Client</code>](#Client)
The client instance of this session.

**Kind**: instance property of [<code>ClientSession</code>](#ClientSession)  
<a name="Session+state"></a>

### clientSession.state : <code>number</code>
The state of the session.

**Kind**: instance property of [<code>ClientSession</code>](#ClientSession)  
**Overrides**: [<code>state</code>](#Session+state)  
<a name="Session+request"></a>

### clientSession.request : <code>http.IncomingMessage</code>
An instance of http.IncomingMessage.

**Kind**: instance property of [<code>ClientSession</code>](#ClientSession)  
**See**: [https://nodejs.org/api/http.html#http_class_http_incomingmessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)  
<a name="Session+socket"></a>

### clientSession.socket : <code>net.Socket</code>
The net.Socket object associated with the connection.

**Kind**: instance property of [<code>ClientSession</code>](#ClientSession)  
<a name="Session+connection"></a>

### clientSession.connection : <code>net.Socket</code>
An alias of [socket](#Session+socket).

**Kind**: instance property of [<code>ClientSession</code>](#ClientSession)  
<a name="Session+setTimeout"></a>

### clientSession.setTimeout(timeout, callback) ⇒ [<code>Session</code>](#Session)
Sets the session to timeout after timeout milliseconds of inactivity on the session.
By default Session do not have a timeout.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback](https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback)  

| Param | Type | Description |
| --- | --- | --- |
| timeout | <code>Number</code> | If timeout is 0, then the existing idle timeout is disabled. |
| callback | <code>function</code> | The callback parameter will be added as a one time listener for the 'timeout' event. |

<a name="Session+setNoDelay"></a>

### clientSession.setNoDelay(noDelay) ⇒ [<code>Session</code>](#Session)
Disables the Nagle algorithm.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay](https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay)  

| Param | Type |
| --- | --- |
| noDelay | <code>Number</code> | 

<a name="Session+setEncoding"></a>

### clientSession.setEncoding(encoding) ⇒ [<code>Session</code>](#Session)
Set the encoding for the socket as a Readable Stream.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding](https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding)  

| Param | Type |
| --- | --- |
| encoding | <code>String</code> | 

<a name="Session+send"></a>

### clientSession.send(data, [binary], [callback]) ⇒ <code>Boolean</code>
Sends data on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The data to be sent. |
| [binary] | <code>Boolean</code> | If the data is binary. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendText"></a>

### clientSession.sendText(data, [callback]) ⇒ <code>Boolean</code>
Sends text data on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | The data to be sent. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendBinary"></a>

### clientSession.sendBinary(data, [callback]) ⇒ <code>Boolean</code>
Sends binary data on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | The data to be sent. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendPing"></a>

### clientSession.sendPing([callback]) ⇒ <code>Boolean</code>
Sends a ping frame on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendPong"></a>

### clientSession.sendPong([callback]) ⇒ <code>Boolean</code>
Sends a pong frame on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendClose"></a>

### clientSession.sendClose([code], [reason], [callback]) ⇒ <code>Boolean</code>
Sends a close frame on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>Number</code> | The status code of close reason. |
| [reason] | <code>String</code> | The close reason. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendFrame"></a>

### clientSession.sendFrame(frame, [callback]) ⇒ <code>Boolean</code>
Sends a WebSocket frame on the socket.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
**Overrides**: [<code>sendFrame</code>](#Session+sendFrame)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| frame | [<code>Frame</code>](#Frame) | The sending frame. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+close"></a>

### clientSession.close([code], [reason])
Half-closes the socket, i.e. it sends a FIN packet. It is possible the server will still send some data.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>Number</code> | The status code of close reason. |
| [reason] | <code>String</code> | The close reason. |

<a name="Session+destroy"></a>

### clientSession.destroy()
Ensures that no more I/O activity happens on this socket.
Only necessary in case of errors.

**Kind**: instance method of [<code>ClientSession</code>](#ClientSession)  
<a name="Session+event_close"></a>

### "close"
Emitted once the socket is fully closed.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  
<a name="Session+event_timeout"></a>

### "timeout"
Emitted if the socket times out from inactivity. This is only to notify that the socket has been idle.
The user must manually close the connection.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  
<a name="Session+event_drain"></a>

### "drain"
Emitted when the write buffer becomes empty.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  
<a name="Session+event_error"></a>

### "error" (error)
Emitted when an error occurs. The 'close' event will be called directly following this event.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error object. |

<a name="Session+event_frame"></a>

### "frame" (frame)
Emitted when a WebSocket frame is received.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  

| Param | Type | Description |
| --- | --- | --- |
| frame | [<code>Frame</code>](#Frame) | The WebSocket frame. |

<a name="Session+event_end"></a>

### "end" (code, Reason)
Emitted when the other end of the socket sends a FIN packet.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>Number</code> | The close code. |
| Reason | <code>String</code> | The close Reason. |

<a name="Session+event_ping"></a>

### "ping"
Emitted when a Ping frame is received.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  
<a name="Session+event_pong"></a>

### "pong"
Emitted when a Pong frame is received.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  
<a name="Session+event_data"></a>

### "data" (data)
Emitted when data is received.

**Kind**: event emitted by [<code>ClientSession</code>](#ClientSession)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The received data. |

<a name="Frame"></a>

## Frame
**Kind**: global class  

* [Frame](#Frame)
    * [new Frame(data, [binary])](#new_Frame_new)
    * _instance_
        * [.encode()](#Frame+encode) ⇒ [<code>Frame</code>](#Frame)
        * [.decode()](#Frame+decode) ⇒ [<code>Frame</code>](#Frame)
        * [.toBuffer()](#Frame+toBuffer) ⇒ <code>Buffer</code>
    * _static_
        * [.OPCODE_CONTINUATION](#Frame.OPCODE_CONTINUATION)
        * [.OPCODE_TEXT](#Frame.OPCODE_TEXT)
        * [.OPCODE_BINARY](#Frame.OPCODE_BINARY)
        * [.OPCODE_CLOSE](#Frame.OPCODE_CLOSE)
        * [.OPCODE_PING](#Frame.OPCODE_PING)
        * [.OPCODE_PONG](#Frame.OPCODE_PONG)

<a name="new_Frame_new"></a>

### new Frame(data, [binary])
Each data frame follows this format:
<pre>
  0               1               2               3
  0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
 +-+-+-+-+-------+-+-------------+-------------------------------+
 |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
 |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
 |N|V|V|V|       |S|             |   (if payload len==126/127)   |
 | |1|2|3|       |K|             |                               |
 +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
 |     Extended payload length continued, if payload len == 127  |
 + - - - - - - - - - - - - - - - +-------------------------------+
 |                               |Masking-key, if MASK set to 1  |
 +-------------------------------+-------------------------------+
 | Masking-key (continued)       |          Payload Data         |
 +-------------------------------- - - - - - - - - - - - - - - - +
 :                     Payload Data continued ...                :
 + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
 |                     Payload Data continued ...                |
 +---------------------------------------------------------------+
</pre>


| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The payload data. |
| [binary] | <code>Boolean</code> | If the data is binary. |

<a name="Frame+encode"></a>

### frame.encode() ⇒ [<code>Frame</code>](#Frame)
Encode the frame data.

**Kind**: instance method of [<code>Frame</code>](#Frame)  
**Returns**: [<code>Frame</code>](#Frame) - this  
<a name="Frame+decode"></a>

### frame.decode() ⇒ [<code>Frame</code>](#Frame)
Decode the frame data.

**Kind**: instance method of [<code>Frame</code>](#Frame)  
**Returns**: [<code>Frame</code>](#Frame) - this  
<a name="Frame+toBuffer"></a>

### frame.toBuffer() ⇒ <code>Buffer</code>
Return a buffer of the Frame instance.

**Kind**: instance method of [<code>Frame</code>](#Frame)  
<a name="Frame.OPCODE_CONTINUATION"></a>

### Frame.OPCODE\_CONTINUATION
**Kind**: static constant of [<code>Frame</code>](#Frame)  
<a name="Frame.OPCODE_TEXT"></a>

### Frame.OPCODE\_TEXT
**Kind**: static constant of [<code>Frame</code>](#Frame)  
<a name="Frame.OPCODE_BINARY"></a>

### Frame.OPCODE\_BINARY
**Kind**: static constant of [<code>Frame</code>](#Frame)  
<a name="Frame.OPCODE_CLOSE"></a>

### Frame.OPCODE\_CLOSE
**Kind**: static constant of [<code>Frame</code>](#Frame)  
<a name="Frame.OPCODE_PING"></a>

### Frame.OPCODE\_PING
**Kind**: static constant of [<code>Frame</code>](#Frame)  
<a name="Frame.OPCODE_PONG"></a>

### Frame.OPCODE\_PONG
**Kind**: static constant of [<code>Frame</code>](#Frame)  
<a name="Receiver"></a>

## Receiver ⇐ <code>stream.Duplex</code>
**Kind**: global class  
**Extends**: <code>stream.Duplex</code>  

* [Receiver](#Receiver) ⇐ <code>stream.Duplex</code>
    * [new Receiver()](#new_Receiver_new)
    * ["data" (data)](#Receiver+event_data)

<a name="new_Receiver_new"></a>

### new Receiver()
WebSocket Frame Receiver

<a name="Receiver+event_data"></a>

### "data" (data)
**Kind**: event emitted by [<code>Receiver</code>](#Receiver)  

| Param | Type | Description |
| --- | --- | --- |
| data | [<code>Frame</code>](#Frame) | The received WebSocket frame. |

<a name="Server"></a>

## Server ⇐ <code>events.EventEmitter</code>
**Kind**: global class  
**Extends**: <code>events.EventEmitter</code>  

* [Server](#Server) ⇐ <code>events.EventEmitter</code>
    * [new Server([options], [sessionListener])](#new_Server_new)
    * [.path](#Server+path) : <code>String</code>
    * [.httpServer](#Server+httpServer) : <code>http.Server</code>
    * [.autoAccept](#Server+autoAccept) : <code>Boolean</code>
    * [.timeout](#Server+timeout) : <code>number</code>
    * [.address()](#Server+address) ⇒ <code>Object</code>
    * [.listen(port, [host], [backlog], [callback])](#Server+listen)
    * [.close([callback])](#Server+close)
    * [.setTimeout(msecs, [callback])](#Server+setTimeout)
    * ["connection" (socket)](#Server+event_connection)
    * ["clientError" (error, session)](#Server+event_clientError)
    * ["session" (session)](#Server+event_session)
    * ["listening"](#Server+event_listening)
    * ["close"](#Server+event_close)
    * ["timeout" (socket)](#Server+event_timeout)
    * ["error" (error)](#Server+event_error)

<a name="new_Server_new"></a>

### new Server([options], [sessionListener])
WebSocket Server


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  |  |
| [options.path] | <code>String</code> |  | see [path](#Server+path) |
| [options.httpServer] | <code>http.Server</code> |  | see [httpServer](#Server+httpServer) |
| [options.autoAccept] | <code>Boolean</code> | <code>true</code> | see [autoAccept](#Server+autoAccept) |
| [sessionListener] | <code>function</code> |  | A listener for the 'session' event. |

<a name="Server+path"></a>

### server.path : <code>String</code>
Accept only connections matching this path.

**Kind**: instance property of [<code>Server</code>](#Server)  
<a name="Server+httpServer"></a>

### server.httpServer : <code>http.Server</code>
The Node http or https server instance to attach to.

**Kind**: instance property of [<code>Server</code>](#Server)  
**Default**: <code>http.createServer();</code>  
<a name="Server+autoAccept"></a>

### server.autoAccept : <code>Boolean</code>
If true, the server will accept sessions automatically, otherwise, you should resolve sessions
by calling [Session#accept](Session#accept) or [Session#reject](Session#reject) method in [Server#session](Server#session) event.

**Kind**: instance property of [<code>Server</code>](#Server)  
**Default**: <code>true</code>  
<a name="Server+timeout"></a>

### server.timeout : <code>number</code>
The number of milliseconds of inactivity before a socket is presumed to have timed out.

**Kind**: instance property of [<code>Server</code>](#Server)  
**See**: [https://nodejs.org/api/http.html#http_server_timeout](https://nodejs.org/api/http.html#http_server_timeout)  
<a name="Server+address"></a>

### server.address() ⇒ <code>Object</code>
Returns the bound address

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+listen"></a>

### server.listen(port, [host], [backlog], [callback])
Begin accepting sessions.

**Kind**: instance method of [<code>Server</code>](#Server)  
**See**: [https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback](https://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback)  

| Param | Type | Description |
| --- | --- | --- |
| port | <code>Number</code> | The listening IP. |
| [host] | <code>String</code> | The listening host. |
| [backlog] | <code>Number</code> | maximum length of the queue of pending sessions. |
| [callback] | <code>function</code> | A listener for the 'listening' event. |

<a name="Server+close"></a>

### server.close([callback])
Stops the server from accepting new sessions and keeps existing sessions.
This function is asynchronous, the server is finally closed when all sessions
are ended and the server emits a 'close' event.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | A Listener for the 'close' event. |

<a name="Server+setTimeout"></a>

### server.setTimeout(msecs, [callback])
Sets the timeout value for sockets.

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| msecs | <code>Number</code> | milliseconds |
| [callback] | <code>function</code> | A Listener for the 'timeout' event. |

<a name="Server+event_connection"></a>

### "connection" (socket)
Emitted when a new TCP stream is established.

**Kind**: event emitted by [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>Socket</code> | A net.Socket instance. |

<a name="Server+event_clientError"></a>

### "clientError" (error, session)
If a client session emits an 'error' event, it will be forwarded here.

**Kind**: event emitted by [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The Error object. |
| session | [<code>Session</code>](#Session) | The Session instance. |

<a name="Server+event_session"></a>

### "session" (session)
Emitted when a new session is established.

**Kind**: event emitted by [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| session | [<code>Session</code>](#Session) | A session instance. |

<a name="Server+event_listening"></a>

### "listening"
**Kind**: event emitted by [<code>Server</code>](#Server)  
<a name="Server+event_close"></a>

### "close"
Emitted when the server closes.

**Kind**: event emitted by [<code>Server</code>](#Server)  
<a name="Server+event_timeout"></a>

### "timeout" (socket)
**Kind**: event emitted by [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| socket | <code>Socket</code> | The socket instance. |

<a name="Server+event_error"></a>

### "error" (error)
Emitted when an error occurs.

**Kind**: event emitted by [<code>Server</code>](#Server)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error object. |

<a name="ServerSession"></a>

## ServerSession ⇐ [<code>Session</code>](#Session)
**Kind**: global class  
**Extends**: [<code>Session</code>](#Session)  

* [ServerSession](#ServerSession) ⇐ [<code>Session</code>](#Session)
    * [new ServerSession(request, socket, [head], [server])](#new_ServerSession_new)
    * [.server](#ServerSession+server) : [<code>Server</code>](#Server)
    * [.statusCode](#ServerSession+statusCode) : <code>Number</code>
    * [.statusMessage](#ServerSession+statusMessage) : <code>String</code>
    * [.state](#Session+state) : <code>number</code>
    * [.request](#Session+request) : <code>http.IncomingMessage</code>
    * [.socket](#Session+socket) : <code>net.Socket</code>
    * [.connection](#Session+connection) : <code>net.Socket</code>
    * [.accept([headers])](#ServerSession+accept)
    * [.reject([statusCode], [headers], [body], [encoding])](#ServerSession+reject)
    * [.setHeader(name, value)](#ServerSession+setHeader)
    * [.writeHead(statusCode, [statusMessage], [headers])](#ServerSession+writeHead)
    * [.setTimeout(timeout, callback)](#Session+setTimeout) ⇒ [<code>Session</code>](#Session)
    * [.setNoDelay(noDelay)](#Session+setNoDelay) ⇒ [<code>Session</code>](#Session)
    * [.setEncoding(encoding)](#Session+setEncoding) ⇒ [<code>Session</code>](#Session)
    * [.send(data, [binary], [callback])](#Session+send) ⇒ <code>Boolean</code>
    * [.sendText(data, [callback])](#Session+sendText) ⇒ <code>Boolean</code>
    * [.sendBinary(data, [callback])](#Session+sendBinary) ⇒ <code>Boolean</code>
    * [.sendPing([callback])](#Session+sendPing) ⇒ <code>Boolean</code>
    * [.sendPong([callback])](#Session+sendPong) ⇒ <code>Boolean</code>
    * [.sendClose([code], [reason], [callback])](#Session+sendClose) ⇒ <code>Boolean</code>
    * [.sendFrame(frame, [callback])](#Session+sendFrame) ⇒ <code>Boolean</code>
    * [.close([code], [reason])](#Session+close)
    * [.destroy()](#Session+destroy)
    * ["close"](#Session+event_close)
    * ["timeout"](#Session+event_timeout)
    * ["drain"](#Session+event_drain)
    * ["error" (error)](#Session+event_error)
    * ["frame" (frame)](#Session+event_frame)
    * ["end" (code, Reason)](#Session+event_end)
    * ["ping"](#Session+event_ping)
    * ["pong"](#Session+event_pong)
    * ["data" (data)](#Session+event_data)

<a name="new_ServerSession_new"></a>

### new ServerSession(request, socket, [head], [server])
WebSocket Server Session


| Param | Type | Description |
| --- | --- | --- |
| request | <code>IncomingMessage</code> | see [request](#Session+request) |
| socket | <code>Socket</code> | see [socket](#Session+socket) |
| [head] | <code>Buffer</code> | Data that received with headers. |
| [server] | [<code>Server</code>](#Server) | see [server](#ServerSession+server) |

<a name="ServerSession+server"></a>

### serverSession.server : [<code>Server</code>](#Server)
The server instance of this session.

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
<a name="ServerSession+statusCode"></a>

### serverSession.statusCode : <code>Number</code>
The HTTP status code of handshake.

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
**Default**: <code>200</code>  
<a name="ServerSession+statusMessage"></a>

### serverSession.statusMessage : <code>String</code>
The HTTP status message of handshake.

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
<a name="Session+state"></a>

### serverSession.state : <code>number</code>
The state of the session.

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
**Overrides**: [<code>state</code>](#Session+state)  
<a name="Session+request"></a>

### serverSession.request : <code>http.IncomingMessage</code>
An instance of http.IncomingMessage.

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
**See**: [https://nodejs.org/api/http.html#http_class_http_incomingmessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)  
<a name="Session+socket"></a>

### serverSession.socket : <code>net.Socket</code>
The net.Socket object associated with the connection.

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
<a name="Session+connection"></a>

### serverSession.connection : <code>net.Socket</code>
An alias of [socket](#Session+socket).

**Kind**: instance property of [<code>ServerSession</code>](#ServerSession)  
<a name="ServerSession+accept"></a>

### serverSession.accept([headers])
Accept the session request.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Description |
| --- | --- | --- |
| [headers] | <code>Object</code> | Headers to be sent. |

<a name="ServerSession+reject"></a>

### serverSession.reject([statusCode], [headers], [body], [encoding])
Reject the session request.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [statusCode] | <code>Number</code> | <code>403</code> | The HTTP status code of handshake. |
| [headers] | <code>Object</code> |  | Headers to be sent. |
| [body] | <code>String</code> \| <code>Buffer</code> |  | Response body. |
| [encoding] | <code>String</code> |  | The encoding of response body. |

<a name="ServerSession+setHeader"></a>

### serverSession.setHeader(name, value)
Sets a single header value for implicit headers.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  

| Param | Type |
| --- | --- |
| name | <code>String</code> | 
| value | <code>String</code> \| <code>Array</code> | 

<a name="ServerSession+writeHead"></a>

### serverSession.writeHead(statusCode, [statusMessage], [headers])
Sends a response header to the request.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  

| Param | Type |
| --- | --- |
| statusCode | <code>Number</code> | 
| [statusMessage] | <code>String</code> | 
| [headers] | <code>Object</code> | 

<a name="Session+setTimeout"></a>

### serverSession.setTimeout(timeout, callback) ⇒ [<code>Session</code>](#Session)
Sets the session to timeout after timeout milliseconds of inactivity on the session.
By default Session do not have a timeout.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback](https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback)  

| Param | Type | Description |
| --- | --- | --- |
| timeout | <code>Number</code> | If timeout is 0, then the existing idle timeout is disabled. |
| callback | <code>function</code> | The callback parameter will be added as a one time listener for the 'timeout' event. |

<a name="Session+setNoDelay"></a>

### serverSession.setNoDelay(noDelay) ⇒ [<code>Session</code>](#Session)
Disables the Nagle algorithm.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay](https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay)  

| Param | Type |
| --- | --- |
| noDelay | <code>Number</code> | 

<a name="Session+setEncoding"></a>

### serverSession.setEncoding(encoding) ⇒ [<code>Session</code>](#Session)
Set the encoding for the socket as a Readable Stream.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding](https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding)  

| Param | Type |
| --- | --- |
| encoding | <code>String</code> | 

<a name="Session+send"></a>

### serverSession.send(data, [binary], [callback]) ⇒ <code>Boolean</code>
Sends data on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The data to be sent. |
| [binary] | <code>Boolean</code> | If the data is binary. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendText"></a>

### serverSession.sendText(data, [callback]) ⇒ <code>Boolean</code>
Sends text data on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | The data to be sent. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendBinary"></a>

### serverSession.sendBinary(data, [callback]) ⇒ <code>Boolean</code>
Sends binary data on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | The data to be sent. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendPing"></a>

### serverSession.sendPing([callback]) ⇒ <code>Boolean</code>
Sends a ping frame on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendPong"></a>

### serverSession.sendPong([callback]) ⇒ <code>Boolean</code>
Sends a pong frame on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendClose"></a>

### serverSession.sendClose([code], [reason], [callback]) ⇒ <code>Boolean</code>
Sends a close frame on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>Number</code> | The status code of close reason. |
| [reason] | <code>String</code> | The close reason. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendFrame"></a>

### serverSession.sendFrame(frame, [callback]) ⇒ <code>Boolean</code>
Sends a WebSocket frame on the socket.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
**Overrides**: [<code>sendFrame</code>](#Session+sendFrame)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| frame | [<code>Frame</code>](#Frame) | The sending frame. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+close"></a>

### serverSession.close([code], [reason])
Half-closes the socket, i.e. it sends a FIN packet. It is possible the server will still send some data.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>Number</code> | The status code of close reason. |
| [reason] | <code>String</code> | The close reason. |

<a name="Session+destroy"></a>

### serverSession.destroy()
Ensures that no more I/O activity happens on this socket.
Only necessary in case of errors.

**Kind**: instance method of [<code>ServerSession</code>](#ServerSession)  
<a name="Session+event_close"></a>

### "close"
Emitted once the socket is fully closed.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  
<a name="Session+event_timeout"></a>

### "timeout"
Emitted if the socket times out from inactivity. This is only to notify that the socket has been idle.
The user must manually close the connection.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  
<a name="Session+event_drain"></a>

### "drain"
Emitted when the write buffer becomes empty.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  
<a name="Session+event_error"></a>

### "error" (error)
Emitted when an error occurs. The 'close' event will be called directly following this event.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error object. |

<a name="Session+event_frame"></a>

### "frame" (frame)
Emitted when a WebSocket frame is received.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Description |
| --- | --- | --- |
| frame | [<code>Frame</code>](#Frame) | The WebSocket frame. |

<a name="Session+event_end"></a>

### "end" (code, Reason)
Emitted when the other end of the socket sends a FIN packet.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>Number</code> | The close code. |
| Reason | <code>String</code> | The close Reason. |

<a name="Session+event_ping"></a>

### "ping"
Emitted when a Ping frame is received.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  
<a name="Session+event_pong"></a>

### "pong"
Emitted when a Pong frame is received.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  
<a name="Session+event_data"></a>

### "data" (data)
Emitted when data is received.

**Kind**: event emitted by [<code>ServerSession</code>](#ServerSession)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The received data. |

<a name="Session"></a>

## Session ⇐ <code>stream.Duplex</code>
**Kind**: global class  
**Extends**: <code>stream.Duplex</code>  

* [Session](#Session) ⇐ <code>stream.Duplex</code>
    * [new Session(request, socket, [head])](#new_Session_new)
    * _instance_
        * [.state](#Session+state) : <code>number</code>
        * [.request](#Session+request) : <code>http.IncomingMessage</code>
        * [.socket](#Session+socket) : <code>net.Socket</code>
        * [.connection](#Session+connection) : <code>net.Socket</code>
        * [.setTimeout(timeout, callback)](#Session+setTimeout) ⇒ [<code>Session</code>](#Session)
        * [.setNoDelay(noDelay)](#Session+setNoDelay) ⇒ [<code>Session</code>](#Session)
        * [.setEncoding(encoding)](#Session+setEncoding) ⇒ [<code>Session</code>](#Session)
        * [.send(data, [binary], [callback])](#Session+send) ⇒ <code>Boolean</code>
        * [.sendText(data, [callback])](#Session+sendText) ⇒ <code>Boolean</code>
        * [.sendBinary(data, [callback])](#Session+sendBinary) ⇒ <code>Boolean</code>
        * [.sendPing([callback])](#Session+sendPing) ⇒ <code>Boolean</code>
        * [.sendPong([callback])](#Session+sendPong) ⇒ <code>Boolean</code>
        * [.sendClose([code], [reason], [callback])](#Session+sendClose) ⇒ <code>Boolean</code>
        * [.sendFrame(frame, [callback])](#Session+sendFrame) ⇒ <code>Boolean</code>
        * [.close([code], [reason])](#Session+close)
        * [.destroy()](#Session+destroy)
        * ["close"](#Session+event_close)
        * ["timeout"](#Session+event_timeout)
        * ["drain"](#Session+event_drain)
        * ["error" (error)](#Session+event_error)
        * ["frame" (frame)](#Session+event_frame)
        * ["end" (code, Reason)](#Session+event_end)
        * ["ping"](#Session+event_ping)
        * ["pong"](#Session+event_pong)
        * ["data" (data)](#Session+event_data)
    * _static_
        * [.STATE_CONNECTING](#Session.STATE_CONNECTING)
        * [.STATE_OPEN](#Session.STATE_OPEN)
        * [.STATE_CLOSING](#Session.STATE_CLOSING)
        * [.STATE_CLOSED](#Session.STATE_CLOSED)
        * [.CLOSE_REASON_NORMAL](#Session.CLOSE_REASON_NORMAL)
        * [.CLOSE_REASON_GOING_AWAY](#Session.CLOSE_REASON_GOING_AWAY)
        * [.CLOSE_REASON_PROTOCOL_ERROR](#Session.CLOSE_REASON_PROTOCOL_ERROR)
        * [.CLOSE_REASON_UNSUPPORTED_DATA](#Session.CLOSE_REASON_UNSUPPORTED_DATA)
        * [.CLOSE_REASON_RESERVED](#Session.CLOSE_REASON_RESERVED)
        * [.CLOSE_REASON_NO_STATUS](#Session.CLOSE_REASON_NO_STATUS)
        * [.CLOSE_REASON_ABNORMAL](#Session.CLOSE_REASON_ABNORMAL)
        * [.CLOSE_REASON_INVALID_DATA](#Session.CLOSE_REASON_INVALID_DATA)
        * [.CLOSE_REASON_POLICY_VIOLATION](#Session.CLOSE_REASON_POLICY_VIOLATION)
        * [.CLOSE_REASON_MESSAGE_TOO_BIG](#Session.CLOSE_REASON_MESSAGE_TOO_BIG)
        * [.CLOSE_REASON_EXTENSION_REQUIRED](#Session.CLOSE_REASON_EXTENSION_REQUIRED)
        * [.CLOSE_REASON_INTERNAL_SERVER_ERROR](#Session.CLOSE_REASON_INTERNAL_SERVER_ERROR)
        * [.CLOSE_REASON_SERVICE_RESTART](#Session.CLOSE_REASON_SERVICE_RESTART)
        * [.CLOSE_REASON_TRY_AGAIN_LATER](#Session.CLOSE_REASON_TRY_AGAIN_LATER)
        * [.CLOSE_REASON_TLS_HANDSHAKE_FAILED](#Session.CLOSE_REASON_TLS_HANDSHAKE_FAILED)

<a name="new_Session_new"></a>

### new Session(request, socket, [head])
WebSocket Session


| Param | Type | Description |
| --- | --- | --- |
| request | <code>http.IncomingMessage</code> | see [request](#Session+request) |
| socket | <code>net.Socket</code> | see [socket](#Session+socket) |
| [head] | <code>Buffer</code> | Data that received with headers. |

<a name="Session+state"></a>

### session.state : <code>number</code>
The state of the session.

**Kind**: instance property of [<code>Session</code>](#Session)  
<a name="Session+request"></a>

### session.request : <code>http.IncomingMessage</code>
An instance of http.IncomingMessage.

**Kind**: instance property of [<code>Session</code>](#Session)  
**See**: [https://nodejs.org/api/http.html#http_class_http_incomingmessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)  
<a name="Session+socket"></a>

### session.socket : <code>net.Socket</code>
The net.Socket object associated with the connection.

**Kind**: instance property of [<code>Session</code>](#Session)  
<a name="Session+connection"></a>

### session.connection : <code>net.Socket</code>
An alias of [socket](#Session+socket).

**Kind**: instance property of [<code>Session</code>](#Session)  
<a name="Session+setTimeout"></a>

### session.setTimeout(timeout, callback) ⇒ [<code>Session</code>](#Session)
Sets the session to timeout after timeout milliseconds of inactivity on the session.
By default Session do not have a timeout.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback](https://nodejs.org/api/net.html#net_socket_settimeout_timeout_callback)  

| Param | Type | Description |
| --- | --- | --- |
| timeout | <code>Number</code> | If timeout is 0, then the existing idle timeout is disabled. |
| callback | <code>function</code> | The callback parameter will be added as a one time listener for the 'timeout' event. |

<a name="Session+setNoDelay"></a>

### session.setNoDelay(noDelay) ⇒ [<code>Session</code>](#Session)
Disables the Nagle algorithm.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay](https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay)  

| Param | Type |
| --- | --- |
| noDelay | <code>Number</code> | 

<a name="Session+setEncoding"></a>

### session.setEncoding(encoding) ⇒ [<code>Session</code>](#Session)
Set the encoding for the socket as a Readable Stream.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: [<code>Session</code>](#Session) - this  
**See**: [https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding](https://nodejs.org/api/stream.html#stream_readable_setencoding_encoding)  

| Param | Type |
| --- | --- |
| encoding | <code>String</code> | 

<a name="Session+send"></a>

### session.send(data, [binary], [callback]) ⇒ <code>Boolean</code>
Sends data on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The data to be sent. |
| [binary] | <code>Boolean</code> | If the data is binary. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendText"></a>

### session.sendText(data, [callback]) ⇒ <code>Boolean</code>
Sends text data on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> | The data to be sent. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendBinary"></a>

### session.sendBinary(data, [callback]) ⇒ <code>Boolean</code>
Sends binary data on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | The data to be sent. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendPing"></a>

### session.sendPing([callback]) ⇒ <code>Boolean</code>
Sends a ping frame on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendPong"></a>

### session.sendPong([callback]) ⇒ <code>Boolean</code>
Sends a pong frame on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendClose"></a>

### session.sendClose([code], [reason], [callback]) ⇒ <code>Boolean</code>
Sends a close frame on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>Number</code> | The status code of close reason. |
| [reason] | <code>String</code> | The close reason. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+sendFrame"></a>

### session.sendFrame(frame, [callback]) ⇒ <code>Boolean</code>
Sends a WebSocket frame on the socket.

**Kind**: instance method of [<code>Session</code>](#Session)  
**Returns**: <code>Boolean</code> - Returns true if the entire data was flushed successfully to the kernel buffer.  

| Param | Type | Description |
| --- | --- | --- |
| frame | [<code>Frame</code>](#Frame) | The sending frame. |
| [callback] | <code>function</code> | The callback parameter will be executed when the data is finally written out. |

<a name="Session+close"></a>

### session.close([code], [reason])
Half-closes the socket, i.e. it sends a FIN packet. It is possible the server will still send some data.

**Kind**: instance method of [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| [code] | <code>Number</code> | The status code of close reason. |
| [reason] | <code>String</code> | The close reason. |

<a name="Session+destroy"></a>

### session.destroy()
Ensures that no more I/O activity happens on this socket.
Only necessary in case of errors.

**Kind**: instance method of [<code>Session</code>](#Session)  
<a name="Session+event_close"></a>

### "close"
Emitted once the socket is fully closed.

**Kind**: event emitted by [<code>Session</code>](#Session)  
<a name="Session+event_timeout"></a>

### "timeout"
Emitted if the socket times out from inactivity. This is only to notify that the socket has been idle.
The user must manually close the connection.

**Kind**: event emitted by [<code>Session</code>](#Session)  
<a name="Session+event_drain"></a>

### "drain"
Emitted when the write buffer becomes empty.

**Kind**: event emitted by [<code>Session</code>](#Session)  
<a name="Session+event_error"></a>

### "error" (error)
Emitted when an error occurs. The 'close' event will be called directly following this event.

**Kind**: event emitted by [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | The error object. |

<a name="Session+event_frame"></a>

### "frame" (frame)
Emitted when a WebSocket frame is received.

**Kind**: event emitted by [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| frame | [<code>Frame</code>](#Frame) | The WebSocket frame. |

<a name="Session+event_end"></a>

### "end" (code, Reason)
Emitted when the other end of the socket sends a FIN packet.

**Kind**: event emitted by [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| code | <code>Number</code> | The close code. |
| Reason | <code>String</code> | The close Reason. |

<a name="Session+event_ping"></a>

### "ping"
Emitted when a Ping frame is received.

**Kind**: event emitted by [<code>Session</code>](#Session)  
<a name="Session+event_pong"></a>

### "pong"
Emitted when a Pong frame is received.

**Kind**: event emitted by [<code>Session</code>](#Session)  
<a name="Session+event_data"></a>

### "data" (data)
Emitted when data is received.

**Kind**: event emitted by [<code>Session</code>](#Session)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>String</code> \| <code>Buffer</code> | The received data. |

<a name="Session.STATE_CONNECTING"></a>

### Session.STATE\_CONNECTING
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.STATE_OPEN"></a>

### Session.STATE\_OPEN
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.STATE_CLOSING"></a>

### Session.STATE\_CLOSING
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.STATE_CLOSED"></a>

### Session.STATE\_CLOSED
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_NORMAL"></a>

### Session.CLOSE\_REASON\_NORMAL
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_GOING_AWAY"></a>

### Session.CLOSE\_REASON\_GOING\_AWAY
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_PROTOCOL_ERROR"></a>

### Session.CLOSE\_REASON\_PROTOCOL\_ERROR
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_UNSUPPORTED_DATA"></a>

### Session.CLOSE\_REASON\_UNSUPPORTED\_DATA
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_RESERVED"></a>

### Session.CLOSE\_REASON\_RESERVED
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_NO_STATUS"></a>

### Session.CLOSE\_REASON\_NO\_STATUS
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_ABNORMAL"></a>

### Session.CLOSE\_REASON\_ABNORMAL
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_INVALID_DATA"></a>

### Session.CLOSE\_REASON\_INVALID\_DATA
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_POLICY_VIOLATION"></a>

### Session.CLOSE\_REASON\_POLICY\_VIOLATION
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_MESSAGE_TOO_BIG"></a>

### Session.CLOSE\_REASON\_MESSAGE\_TOO\_BIG
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_EXTENSION_REQUIRED"></a>

### Session.CLOSE\_REASON\_EXTENSION\_REQUIRED
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_INTERNAL_SERVER_ERROR"></a>

### Session.CLOSE\_REASON\_INTERNAL\_SERVER\_ERROR
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_SERVICE_RESTART"></a>

### Session.CLOSE\_REASON\_SERVICE\_RESTART
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_TRY_AGAIN_LATER"></a>

### Session.CLOSE\_REASON\_TRY\_AGAIN\_LATER
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="Session.CLOSE_REASON_TLS_HANDSHAKE_FAILED"></a>

### Session.CLOSE\_REASON\_TLS\_HANDSHAKE\_FAILED
**Kind**: static constant of [<code>Session</code>](#Session)  
<a name="createServer"></a>

## createServer([options], [sessionListener]) ⇒ [<code>Server</code>](#Server)
Create a WebSocket Server.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> |  |  |
| [options.path] | <code>String</code> |  | see [path](#Server+path) |
| [options.httpServer] | <code>http.Server</code> |  | see [httpServer](#Server+httpServer) |
| [options.autoAccept] | <code>Boolean</code> | <code>true</code> | see [autoAccept](#Server+autoAccept) |
| [sessionListener] | <code>function</code> |  | A listener for the 'session' event. |

<a name="connect"></a>

## connect([options], [connectListener]) ⇒ [<code>Client</code>](#Client)
Create a connection to the WebSocket Server.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Number</code> \| <code>String</code> \| <code>Object</code> |  | If options is a string, it is automatically parsed with url.parse(). |
| [options.host] | <code>String</code> | <code>localhost</code> | A domain name or IP address of the server. |
| [options.port] | <code>Number</code> | <code>80|443</code> | Port of remote server. |
| [options.headers] | <code>Object</code> |  | Headers to be sent to the server. |
| [options.subProtocols] | <code>String</code> \| <code>Array</code> |  | The list of WebSocket sub-protocols. |
| [connectListener] | <code>function</code> |  | A one time listener for the 'connect' event. |

