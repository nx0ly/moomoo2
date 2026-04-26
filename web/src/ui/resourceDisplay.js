import Tree from "../assets/tree.png";

export class ResourceDisplay {
    constructor() {
        this.holder = document.createElement("div");
        this.holder.style = `
        position: absolute;
        bottom: 100px;
        right: 10px;
        width: 100px;
        transform: translate(-10px, -100px);
        display: flex;
        align-items: center;
        flex-direction: column;
        gap: 10px;
        font-family: GameFont;
        `;

        this.children = {};

        document.body.appendChild(this.holder);

        this.addResource(Tree, "wood", 0);
    }

    updateResource(name, val) {
        this.children[name].textContent = val;
    }

    addResource(texture, name, current) {
        let entry = document.createElement("div");
        entry.style = `
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.25);
        display: flex;
        justify-content: space-between;
        padding: 4px;
        align-items: center;
        border-radius: 4px;
        `;
        // this.holder.style.borderRadius = "4px";


        let img = new Image();
        img.src = texture;
        img.onload = () => {
            img.style = `
                width: 35px;
                height: 35px;
                `;
        };
        entry.appendChild(img);

        let counter = document.createElement("div");
        counter.textContent = current;
        counter.style.padding = "4px";
        counter.style.color = "rgb(220, 220, 220)";
        this.children[name] = counter;

        entry.appendChild(counter);

        this.holder.appendChild(entry);
    }
}