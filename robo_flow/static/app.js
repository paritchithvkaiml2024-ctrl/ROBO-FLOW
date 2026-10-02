const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let image = new Image();

let boxes = [];
let mode =
    localStorage.getItem("annotationMode")
    || "rect";
let polygonPoints = [];
let startX = 0;
let startY = 0;

let drawing = false;

let currentClass =
    parseInt(
        localStorage.getItem("currentClass")
    ) || 0;
    const CLASS_COLORS = [];

for(
    let i = 0;
    i < CLASSES.length;
    i++
){

    const hue =
        (i * 137.508) % 360;

    CLASS_COLORS.push(
        `hsl(${hue},90%,55%)`
    );

}
image.onload = () => {

    canvas.width = image.width;
    canvas.height = image.height;

    redraw();

};

image.src = "/image";
window.addEventListener(
    "load",
    () => {
        document.getElementById(
    "modeDisplay"
).innerText =
mode === "polygon"
?
"Mode: 4 Point Polygon"
:
"Mode: Rectangle";
        document.getElementById(
            "selectedClass"
        ).innerText =
        "Class: "
        +
        currentClass
        +
        " ("
        +
        CLASSES[currentClass]
        +
        ")";

    }
);

function redraw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.drawImage(
        image,
        0,
        0
    );

    boxes.forEach(box => {

    if(box.type === "polygon"){

        ctx.strokeStyle =
    CLASS_COLORS[
        box.class_id
    ];
        ctx.lineWidth = 2;

        ctx.beginPath();

        ctx.moveTo(
            box.points[0][0],
            box.points[0][1]
        );

        for(
            let i = 1;
            i < box.points.length;
            i++
        ){

            ctx.lineTo(
                box.points[i][0],
                box.points[i][1]
            );

        }

        ctx.closePath();

        ctx.stroke();

        return;
    }

    ctx.strokeStyle =
    CLASS_COLORS[
        box.class_id
    ];
    ctx.lineWidth = 2;

    ctx.strokeRect(
        box.x,
        box.y,
        box.w,
        box.h
    );
    ctx.fillStyle =
    CLASS_COLORS[
        box.class_id
    ];

ctx.font =
    "16px Arial";

ctx.fillText(
    CLASSES[
        box.class_id
    ],
    box.x,
    box.y - 5
);

});
if(
    mode === "polygon"
    &&
    polygonPoints.length > 0
){

    ctx.strokeStyle = "yellow";

    ctx.beginPath();

    ctx.moveTo(
        polygonPoints[0][0],
        polygonPoints[0][1]
    );

    for(
        let i = 1;
        i < polygonPoints.length;
        i++
    ){

        ctx.lineTo(
            polygonPoints[i][0],
            polygonPoints[i][1]
        );

    }

    ctx.stroke();
}

}

canvas.addEventListener(
    "mousedown",
    e => {

        if(mode === "polygon"){

    polygonPoints.push([
        e.offsetX,
        e.offsetY
    ]);

    if(polygonPoints.length === 4){

        boxes.push({
            type:"polygon",
            class_id:currentClass,
            points:[...polygonPoints]
        });

        polygonPoints = [];
    }

    redraw();

    return;
}

        drawing = true;

        startX = e.offsetX;
        startY = e.offsetY;

    }
);

canvas.addEventListener(
    "mouseup",
    e => {

        if(!drawing)
            return;

        drawing = false;

        let x = Math.min(
            startX,
            e.offsetX
        );

        let y = Math.min(
            startY,
            e.offsetY
        );

        let w = Math.abs(
            e.offsetX - startX
        );

        let h = Math.abs(
            e.offsetY - startY
        );

        if(mode === "rect"){

    boxes.push({
        type:"rect",
        class_id: currentClass,
        x:x,
        y:y,
        w:w,
        h:h
    });

}

        redraw();

    }
);


document.addEventListener(
    "keydown",
    async e => {

        if(
            e.key >= "0"
            &&
            e.key <= "9"
        ){

            let idx =
                parseInt(e.key);

            if(
    idx < CLASSES.length
){

    currentClass = idx;

    localStorage.setItem(
        "currentClass",
        idx
    );

    document.getElementById(
        "selectedClass"
    ).innerText =
    "Class: "
    +
    idx
    +
    " ("
    +
    CLASSES[idx]
    +
    ")";
}

        }
        if(e.key.toLowerCase() === "r"){

    mode = "rect";

    localStorage.setItem(
        "annotationMode",
        "rect"
    );

    polygonPoints = [];

    document.getElementById(
        "modeDisplay"
    ).innerText =
    "Mode: Rectangle";

}

if(e.key.toLowerCase() === "p"){

    mode = "polygon";

    localStorage.setItem(
        "annotationMode",
        "polygon"
    );

    polygonPoints = [];

    document.getElementById(
        "modeDisplay"
    ).innerText =
    "Mode: 4 Point Polygon";

}

        if(
            e.key.toLowerCase()
            === "c"
        ){

            boxes = [];

            redraw();

        }

        if (
    e.code === "Space"
){

    if(boxes.length === 0)
        return;

    e.preventDefault();

    await fetch(
        "/save_annotation",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                image:IMAGE_NAME,
                annotations:convertYOLO()
            })
        }
    );

    await fetch(
        "/next_image",
        {
            method:"POST"
        }
    );

    location.reload();

}

        if(
            e.key.toLowerCase()
            === "n"
        ){

            await fetch(
                "/next_image",
                {
                    method:"POST"
                }
            );

            location.reload();

        }

    }
);

function convertYOLO(){

    let results = [];

    boxes.forEach(box => {

        if(box.type === "polygon"){

            let points = [];

            box.points.forEach(p => {

                points.push([
                    (
                        p[0] /
                        canvas.width
                    ).toFixed(6),

                    (
                        p[1] /
                        canvas.height
                    ).toFixed(6)
                ]);

            });

            results.push({

                type:"polygon",

                class_id:
                    box.class_id,

                points:
                    points

            });

            return;
        }

        let xc =
            (
                box.x +
                box.w/2
            )
            /
            canvas.width;

        let yc =
            (
                box.y +
                box.h/2
            )
            /
            canvas.height;

        let w =
            box.w
            /
            canvas.width;

        let h =
            box.h
            /
            canvas.height;

        results.push({

            type:"rect",

            class_id:
                box.class_id,

            x:
                xc.toFixed(6),

            y:
                yc.toFixed(6),

            w:
                w.toFixed(6),

            h:
                h.toFixed(6)

        });

    });

    return results;

}