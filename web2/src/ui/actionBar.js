export class ActionBar {
    constructor() {
        this.holder = document.createElement("div");
        this.holder.style.position = "absolute";
        this.holder.style.bottom = "10px";
        this.holder.style.left = "50%";
        this.holder.style.transform = "translate(-50%, -10px)";
        this.holder.style.height = 66;
        this.holder.style.background = "rgba(0, 0, 70, 0.1)";
        this.holder.style.display = "flex";
        this.holder.style.alignItems = "center";
        this.holder.style.justifyContent = "center";
        this.holder.style.gap = "8px";

        this.children = [];

        this.addChild();
        this.addChild();
        this.addChild();


        document.body.appendChild(this.holder);

        console.log("jaja")
    }

    addChild() {
        let child = document.createElement("canvas");
        child.width = child.height = 67;

        let c = child.getContext("2d");
        c.fillStyle = "red";
        c.fillRect(0, 0, child.width, child.height);

        this.holder.appendChild(child);


        return child.getContext("2d");
    }
}