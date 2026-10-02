async function browseVideo(){

    const res =
        await fetch(
            "/browse_video"
        );

    const data =
        await res.json();

    document
        .getElementById(
            "video_path"
        )
        .value =
        data.file;

document
.getElementById(
    "videoPlayer"
)
.src =
"/video_file?path="
+
encodeURIComponent(
    data.file
);

}

async function saveCurrentFrame(){

    const status =
        document.getElementById(
            "captureStatus"
        );

    try{


        const video =
            document.getElementById(
                "videoPlayer"
            );

        if(
            !video.videoWidth
        ){
            alert(
                "Video not loaded yet"
            );
            return;
        }

        const canvas =
            document.getElementById(
                "hiddenCanvas"
            );

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const ctx =
            canvas.getContext("2d");

        ctx.drawImage(
            video,
            0,
            0
        );

        const image =
            canvas.toDataURL(
                "image/jpeg"
            );

        const res =
            await fetch(
                "/save_single_frame",
                {
                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/json"
                    },

                    body:JSON.stringify({

                        image:image,

                        output:
                        document
                        .getElementById(
                            "output_folder"
                        )
                        .value,

                        video_name:
                        document
                        .getElementById(
                            "video_path"
                        )
                        .value
                        .split("\\")
                        .pop()
                        .split(".")[0]

                    })
                }
            );

        const data =
            await res.json();

        const saved =
            document.getElementById(
                "savedCount"
            );

        if(saved){

            saved.innerText =
                data.saved;

        }

    }
    catch(err){

        console.error(
            err
        );

    }
}

let captureInterval = null;

document.addEventListener(
    "keydown",
    e => {

        if(
            e.code === "Space"
            &&
            captureInterval === null
        ){

            e.preventDefault();

            document
            .getElementById(
                "captureStatus"
            )
            .innerText =
            "CAPTURING";

            document
            .getElementById(
                "captureStatus"
            )
            .className =
            "capture-on";

            captureInterval =
                setInterval(
                    saveCurrentFrame,
                    200
                );

        }

    }
);

document.addEventListener(
    "keyup",
    e => {

        if(
            e.code === "Space"
        ){

            clearInterval(
                captureInterval
            );

            captureInterval =
                null;

            document
            .getElementById(
                "captureStatus"
            )
            .innerText =
            "READY";

            document
            .getElementById(
                "captureStatus"
            )
            .className =
            "capture-off";

        }

    }
);

async function browseOutput(){

    const res =
        await fetch(
            "/browse_folder"
        );

    const data =
        await res.json();

    document
        .getElementById(
            "output_folder"
        )
        .value =
        data.folder;

}

function playVideo(){

    document
        .getElementById(
            "videoPlayer"
        )
        .play();

}

function pauseVideo(){

    document
        .getElementById(
            "videoPlayer"
        )
        .pause();

}

async function startExtract(){

    const res =
        await fetch(
            "/extract_video",
            {
                method:"POST",

                headers:{
                    "Content-Type":
                    "application/json"
                },

                body:JSON.stringify({

                    video:
                    document
                    .getElementById(
                        "video_path"
                    )
                    .value,

                    output:
                    document
                    .getElementById(
                        "output_folder"
                    )
                    .value,

                    fps:
                    document
                    .getElementById(
                        "capture_fps"
                    )
                    .value

                })
            }
        );

    const data =
        await res.json();

    document
        .getElementById(
            "status"
        )
        .innerHTML =

        "Saved "

        +

        data.saved

        +

        " frames<br><br>"

        +

        data.folder;
}