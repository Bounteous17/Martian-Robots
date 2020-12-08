export interface planetType {
    id: string,
    name: string,
    dimensions: coordinatesType,
    lostRobotsCoordinates?: coordinatesOrientationType[]
}

export interface coordinatesType {
    x: number,
    y: number
}

export interface coordinatesOrientationType extends coordinatesType {
    orientation: string
}