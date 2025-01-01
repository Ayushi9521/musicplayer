
let currentSong = new Audio();
let songs;
let currFolder;

// convert seconds to mm/ss
function formatTime(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60); // Calculate minutes
    const remainingSeconds = Math.floor(seconds % 60); // Calculate remaining seconds
  
    // Ensure two-digit format for both minutes and seconds
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
  }

async function getSongs(folder) {   
    currFolder = folder; 
    let a =  await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");   
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all the song in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = ""
    for(let song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="" />
                <div class="info">
                  <div>${song}</div>
                  <div>Song Artist</div>
                </div>
                <div class="playNow">
                  <span>Play Now</span>
                  <img src="img/play.svg" class="invert sidePlay" alt="play" />
                </div>
                </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e,index,allItems) =>{
        e.addEventListener("click", element => {
            let mySong = e.querySelector(".info").firstElementChild.innerHTML;
            let img =  e.querySelector(".sidePlay")
            console.log(allItems,"all items" ,img.src)           

            // change play and pause icon as song changes
            if(img.src.includes("play.svg")){
                playMusic(mySong,false);
                // Reset all other play buttons to show "play" icon
                allItems.forEach(item => {
                    const playImg = item.querySelector(".sidePlay");
                    playImg.src = "img/play.svg"; // Set play icon
                    console.log(playImg)
                });
                img.src = "img/pause.svg";
                console.log("inside if",img)
            }
            else{
                playMusic(mySong,true)
                img.src = "img/play.svg";
                console.log("inside else",img)
            }
        })
    })
   
    return songs
}

const playMusic = (song, pause= false) =>{
    currentSong.src=`/${currFolder}/` + song;
    if(!pause){
        currentSong.play();
        play.src = "img/pause.svg";
    }
    else{
        currentSong.pause();
        play.src = "img/play.svg";
    }
   
    document.querySelector(".songInfo").innerHTML = song;
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";

    
}
async function displayAlbum() {
    let a =  await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {    
        const e = array[index]    
        if(e.href.includes("/songs")){
           let folder = e.href.split("/").slice(-2)[0];
            //get the metadata of the folder
            let a =  await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${folder} class="card">
              <div class="circular-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="black"
                  class="bi bi-play-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"
                  />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <h2>${response.title}</h2>
              <p>
                ${response.description}
              </p>
            </div>`
        }
    }

      //load the playlist whenever card is clicked
  
      Array.from(document.getElementsByClassName("card")).forEach( e => {
        e.addEventListener("click",async (item) =>{
             await getSongs(`songs/${item.currentTarget.dataset.folder}`);
             playMusic(songs[0])
        })         
    })
    
}

async function main() {   
     
    // get the list of all songs
    await getSongs("songs/ncs");
    playMusic(songs[0], true)

    //display all the albums in the page
    displayAlbum()

    //attach an event listener to play, next and previous btns
    play.addEventListener("click",() =>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "img/pause.svg";
        }
        else{
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate",() =>{
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        if(currentSong.currentTime == currentSong.duration){
            console.log("inside if statement",play.src)
            play.src = "img/play.svg";
        }
    })

    //add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click",e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent  + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/ 100;
    })

    //add eventlistener for hamburger
    document.querySelector(".hamburger").addEventListener("click",() =>{
        document.querySelector(".left").style.left = 0;
    })

    //add eventlistener for close btn
    document.querySelector(".close").addEventListener("click",() =>{
        document.querySelector(".left").style.left = -120 + "%";
    })

    //previous and next add eventlistener
    previous.addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(index - 1 >= 0){
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if(index + 1 < songs.length  ){
            playMusic(songs[index + 1])
        }
    })

    //add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) =>{
        currentSong.volume = parseInt(e.target.value)/100
        if(currentSong.volume > 0 ){
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("mute.svg","volume.svg") 
        }
    })

    //add eventlistner to mute the track
    document.querySelector(".volume > img").addEventListener("click",(e) => {
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
           e.target.src = e.target.src.replace("volume.svg","mute.svg") 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg") 
            currentSong.volume = 0.3;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30;
        }
    })  
}

main();