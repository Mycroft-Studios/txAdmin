const modulename = 'WebSocket';
import { Server as SocketIO, Socket } from 'socket.io';
import consoleFactory from '@extras/console';
import statusRoom from './wsRooms/status';
import playerlistRoom from './wsRooms/playerlist';
import liveconsoleRoom from './wsRooms/liveconsole';
import serverlogRoom from './wsRooms/serverlog';
import TxAdmin from '@core/txAdmin';
import { AuthedAdminType, checkRequestAuth } from './authLogic';
import { SocketWithSession } from './ctxTypes';
import { isIpAddressLocal } from '@extras/isIpAddressLocal';
const console = consoleFactory(modulename);

//Types
export type RoomCommandHandlerType = {
    permission: string | true;
    handler: (admin: AuthedAdminType, ...args: any) => any
}

export type RoomType = {
    permission: string | true;
    eventName: string;
    cumulativeBuffer: boolean;
    outBuffer: any;
    commands?: Record<string, RoomCommandHandlerType>;
    initialData: () => any;
}

//NOTE: quen adding multiserver, create dynamic rooms like playerlist#<svname>
const VALID_ROOMS = ['status', 'liveconsole', 'serverlog', 'playerlist'] as const;
type RoomNames = typeof VALID_ROOMS[number];


//Helpers
const getIP = (socket: SocketWithSession) => {
    return socket?.request?.socket?.remoteAddress ?? 'unknown';
};
const terminateSession = (socket: SocketWithSession, reason: string, shouldLog = true) => {
    try {
        socket.emit('logout', reason);
        socket.disconnect();
        if (shouldLog) {
            console.verbose.warn('SocketIO', 'dropping new connection:', reason);
        }
    } catch (error) { }
};

export default class WebSocket {
    readonly #txAdmin: TxAdmin;
    readonly #io: SocketIO;
    readonly #rooms: Record<RoomNames, RoomType>;

    constructor(txAdmin: TxAdmin, io: SocketIO) {
        this.#txAdmin = txAdmin;
        this.#io = io;
        this.#rooms = {
            status: statusRoom(txAdmin),
            playerlist: playerlistRoom(txAdmin),
            liveconsole: liveconsoleRoom(txAdmin),
            serverlog: serverlogRoom(txAdmin),
        };

        setInterval(this.flushBuffers.bind(this), 250);
    }


    /**
     * Handles incoming connection requests,
     * NOTE: For now the user MUST join a room, needs additional logic for 'web' room
     */
    handleConnection(socket: SocketWithSession) {
        try {
            //Checking for session auth
            const reqIp = getIP(socket);
            const authResult = checkRequestAuth(
                this.#txAdmin,
                socket.request.headers,
                reqIp,
                isIpAddressLocal(reqIp),
                socket.sessTools
            );
            if (!authResult.success) {
                return terminateSession(socket, 'invalid session', false);
            }
            const { admin: authedAdmin } = authResult;


            //Check if joining any room
            if (typeof socket.handshake.query.rooms !== 'string') {
                return terminateSession(socket, 'no query.rooms');
            }

            //Validating requested rooms
            const requestedRooms = socket.handshake.query.rooms
                .split(',')
                .filter((v, i, arr) => arr.indexOf(v) === i)
                .filter(r => VALID_ROOMS.includes(r as any));
            if (!requestedRooms.length) {
                return terminateSession(socket, 'no valid room requested');
            }

            //For each valid requested room
            for (const requestedRoomName of requestedRooms) {
                const room = this.#rooms[requestedRoomName as RoomNames];

                //Checking Perms
                if (room.permission !== true && !authedAdmin.hasPermission(room.permission)) {
                    continue;
                }

                //Setting up event handlers
                //NOTE: if the admin permissions is removed after connection, he will
                // still have access to the command, only refreshing the entire connection
                // would solve it, since socket.session (therefore authedAdmin) is not auto updated
                for (const [commandName, commandData] of Object.entries(room.commands ?? [])) {
                    if (commandData.permission === true || authedAdmin.hasPermission(commandData.permission)) {
                        socket.on(commandName, commandData.handler.bind(null, authedAdmin));
                    }
                }

                //Sending initial data
                socket.join(requestedRoomName);
                socket.emit(room.eventName, room.initialData());
            }

            //General events
            socket.on('disconnect', (reason) => {
                // console.verbose.debug('SocketIO', `Client disconnected with reason: ${reason}`);
            });
            socket.on('error', (error) => {
                console.verbose.debug('SocketIO', `Socket error with message: ${error.message}`);
            });

            // console.verbose.log('SocketIO', `Connected: ${authedAdmin.name} from ${getIP(socket)}`);
        } catch (error) {
            console.error('SocketIO', `Error handling new connection: ${(error as Error).message}`);
            socket.disconnect();
        }
    }


    /**
     * Adds data to the buffer
     */
    buffer<T>(roomName: RoomNames, data: T) {
        const room = this.#rooms[roomName];
        if (!room) throw new Error('Room not found');

        if (room.cumulativeBuffer) {
            if (Array.isArray(room.outBuffer)) {
                room.outBuffer.push(data);
            } else if (typeof room.outBuffer === 'string') {
                room.outBuffer += data;
            } else {
                throw new Error(`cumulative buffers can only be arrays or strings`);
            }
        } else {
            room.outBuffer = data;
        }
    }


    /**
     * Flushes the data buffers
     * NOTE: this will also send data to users that no longer have permissions
     */
    flushBuffers() {
        for (const [roomName, room] of Object.entries(this.#rooms)) {
            if (room.cumulativeBuffer && room.outBuffer.length) {
                this.#io.to(roomName).emit(room.eventName, room.outBuffer);
                if (Array.isArray(room.outBuffer)) {
                    room.outBuffer = [];
                } else if (typeof room.outBuffer === 'string') {
                    room.outBuffer = '';
                } else {
                    throw new Error(`cumulative buffers can only be arrays or strings`);
                }
            } else if (!room.cumulativeBuffer && room.outBuffer !== null) {
                this.#io.to(roomName).emit(room.eventName, room.outBuffer);
                room.outBuffer = null;
            }
        }
    }


    /**
     * Pushes the initial data again for everyone in a room
     * NOTE: we probably don't need to wait one tick, but since we are working with 
     * event handling, things might take a tick to update their status (maybe discord bot?)
     */
    pushRefresh(roomName: RoomNames) {
        if (!VALID_ROOMS.includes(roomName)) throw new Error(`Invalid room '${roomName}'.`);
        const room = this.#rooms[roomName];
        if (room.cumulativeBuffer) throw new Error(`The room '${roomName}' has a cumulative buffer.`);
        setImmediate(() => {
            room.outBuffer = room.initialData();
        });
    }
};
