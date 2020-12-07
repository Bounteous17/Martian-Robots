export interface environment {
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