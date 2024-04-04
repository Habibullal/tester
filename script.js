
//Global variables
let currentSong = new Audio();
let currFolder;
let songs;
let currVolume = 0.5;

//function for seconds to minutes:seconds format
function formatSecondsToMinutesSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    var formattedTime = minutes.toString().padStart(2, '0') + ':' + Math.floor(remainingSeconds).toString().padStart(2, '0');
    return formattedTime;
}


async function getSongs(folder) {
    //function to get songs out of folder
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}`)
    let res = await a.text();
    let div = document.createElement('div');
    div.innerHTML = res;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`${folder}`)[1]);
        }

    }
    songsUL = document.querySelector('.songsList').getElementsByTagName("ul")[0];
    songsUL.innerHTML = " "
    //displaying all songs
    for (const song of songs) {
        let songFormat = song.replaceAll("%20", " ").replaceAll(".mp3", " ");
        songsUL.innerHTML = songsUL.innerHTML +
            `<li class="flex rounded m-1 p-1">
                <img class="invert" src="img/music.svg" alt="">
                <div class="songCardInfo flex">
                    <div class="songCardInfoInfo">
                        ${songFormat}
                    </div>
                </div>
                <div class="playNow">
                    <span>Play now</span>
                    <img src="img/playGreen.svg" alt="">
                </div>
            </li>`

    }

    playlistHeaderInfo = document.querySelector(".playlistHeader")
    playlistHeaderInfo.innerHTML = 
        `<div class="playlistHeaderCover m-2">
            <img src="http://127.0.0.1:5500/${currFolder}playlistCover.jpg" alt="">
        </div>
        <div class="playlistHeaderInfo m-2">
            <h3>Playlist</h3>
            <p class="playlistName">
                ${currFolder.split("/")[1].replace("-"," ")}
            </p>
            <h3>${songs.length} songs</h3>
        </div>`
    


    //event listener for playing song
    Array.from(document.querySelector(".songsList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector(".songCardInfo").firstElementChild.innerHTML.trim());
        })
    })
    return songs

}

async function displayAlbums() {
    let f = await fetch("http://127.0.0.1:5500/songs/")
    let res1 = await f.text();
    let div = document.createElement('div');
    div.innerHTML = res1;
    let as = div.getElementsByTagName("a")
    let playlistContainer = document.querySelector(".playlistContainer")
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.includes("songs/")) {
            folder = element.href.split("/").splice(-1)[0]
            let fetch3 = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let res3 = await fetch3.json();
            playlistContainer.innerHTML = playlistContainer.innerHTML +
            `<div data-folder="${folder}" class="playlist p-1">
                <div class="play">
                    <img src="img/playGreen.svg" alt="">
                </div>
                <div class="playlistCover">
                    <img src="http://127.0.0.1:5500/songs/${folder}/playlistCover.jpg" alt="">
                </div>
                <h3>${res3.title}</h3>
            </div>`
        }
    }
    //event for displying contents of folder
    Array.from(document.getElementsByClassName("playlist")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}/`)
        })
    })
    



}

//funciton to play music
const playMusic = (track) => {
    if (track.endsWith(".mp3")) {
        currentSong.src = `${currFolder}` + track
    }
    else {
        currentSong.src = `${currFolder}` + track + ".mp3"
    }
    currentSong.play();
    currentSong.volume = currVolume
    play.src = "img/pause.svg"
    document.querySelector(".songInfo").innerHTML = track.replaceAll("%20", " ").replaceAll(".mp3", " ")
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
}

async function main() {
    //get list of all songs
    await getSongs("songs/Lord-Ganesha/")
    displayAlbums();

    //event listner for pause play
    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //eventlistener for time update on playbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = formatSecondsToMinutesSeconds(currentSong.currentTime) + "/" + formatSecondsToMinutesSeconds(currentSong.duration)
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    //adding eventlistner to the seekbar
    document.querySelector(".seekBar").addEventListener('click', e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentSong.currentTime = (e.offsetX / e.target.getBoundingClientRect().width) * currentSong.duration;
    })

    //eventlisteners for next and previous buttons
    previous.addEventListener("click", () => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (currentIndex > 0) {
            playMusic(songs[currentIndex - 1])
        }

    })
    next.addEventListener("click", e => {
        let currentIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if (currentIndex + 1 < songs.length) {
            playMusic(songs[currentIndex + 1])
        }
    })


    //Adding eventlistner to volume
    document.querySelector(".volumeContainer").getElementsByTagName("input")[0].addEventListener("change", e => {
        currentSong.volume = e.target.value / 100
        currVolume = e.target.value / 100;
        if(currentSong.volume!==0){
            volume.src = "img/volume.svg"
        }
    })

    //adding event listner for mute
    document.querySelector(".volumeContainer").getElementsByTagName("img")[0].addEventListener("click", ()=>{    
        if(currentSong.volume!==0){
            currVolume = currentSong.volume
            volume.src="img/mute.svg"
            currentSong.volume = 0
        }
        else{
            volume.src="img/volume.svg"
            currentSong.volume = currVolume
        }
        volSlider.value = currentSong.volume *100
    })



}
main()