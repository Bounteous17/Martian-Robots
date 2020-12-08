export interface environmentType {
    api: {
        autoListen: boolean,
        port: number
    },
    redis: {
        host: string,
        port: number,
        password?: string
    }
}