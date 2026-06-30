import { io } from 'socket.io-client'

const socket = io(window.location.origin, { autoConnect: false })

export function useSocket() {
  if (!socket.connected) socket.connect()
  return socket
}
