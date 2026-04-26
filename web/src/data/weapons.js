import { Assets } from "pixi.js";
import Arm1 from "../assets/arm_1.png";
import Arm2 from "../assets/arm_2.png";

export const WEAPONS = [
    {
        id: 0,
        name: "Fists",
        textures: [Arm1, Arm2],
        hoverDetails: ["Fists", "Used to punch natural objects and other players."],
    },
    {
        id: 1,
        name: "Sword",
        sprite: "",
    },
    {
        id: 2,
        name: "Daggers",
        sprite: "",
    }
];

// for (const weapon of WEAPONS) {
//     weapon.textures?.map(async (x) => await Assets.load(x));
// }