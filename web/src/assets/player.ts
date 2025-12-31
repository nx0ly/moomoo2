export interface Player {
    name: string;
    x: number;
    y: number;
}

export class Player {
    constructor(name: string) {
        this.name = name;
    }
}