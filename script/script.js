const navLinks = document.querySelectorAll('.options-link');

const fixFrameURL = "https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4/";
const api_key = "90080d9d5de3473f8f6fa94ff2e40ca0";

const options = document.querySelectorAll('.desktop-link');
const result = document.getElementById("result");

const leaguesOptions = document.querySelectorAll('#league > li');
const yearlink = document.getElementsByClassName("links")[0].childNodes[1];
let yearValue, leagueValue;
leaguesOptions.forEach(option => {
  option.addEventListener('click', function() {
    options[0].textContent = this.textContent;
    options[0].nextElementSibling.nextElementSibling.textContent = this.textContent;
    leagueValue = this.getAttribute("data-value");
  });
});

yearlink.addEventListener("click", function(){
   const yearsOptions = document.querySelectorAll("#year > li");
   yearsOptions.forEach(option => {
      option.addEventListener('click', function() {
        options[1].textContent = this.textContent;
        options[1].nextElementSibling.nextElementSibling.textContent = this.textContent;
        yearValue = this.getAttribute("data-value");
      });
    });
});

window.addEventListener('resize', function() {
   const screenWidth = window.innerWidth;
   const element = document.getElementById('options');
 
   if (screenWidth > 858) {
     element.classList.add('d-block');
   } else {
     element.classList.remove('d-block');
   }
});

const scrollableOptions = document.getElementById("scrollableDiv");
let isDragging = false;
let startPosition = 0;
let currentScrollLeft = 0;

scrollableOptions.addEventListener("mousedown", startDragging);
scrollableOptions.addEventListener("mousemove", drag);
scrollableOptions.addEventListener("mouseup", stopDragging);
scrollableOptions.addEventListener("touchstart", startDragging);
scrollableOptions.addEventListener("touchmove", drag);
scrollableOptions.addEventListener("touchend", stopDragging);

function startDragging(event) {
  isDragging = true;
  startPosition = getPositionX(event);
  currentScrollLeft = scrollableOptions.scrollLeft;
  scrollableOptions.style.cursor = "grabbing";
}

function drag(event) {
  if (!isDragging) {
    scrollableOptions.style.cursor = "auto";
    return;
  }

  event.preventDefault();
  const currentPosition = getPositionX(event);
  const distance = currentPosition - startPosition;
  scrollableOptions.scrollLeft = currentScrollLeft - distance;
}

function stopDragging() {
  isDragging = false;
  scrollableOptions.style.cursor = "grab";
}

function getPositionX(event) {
  if (event.type.startsWith("touch")) {
    return event.touches[0].clientX;
  }
  return event.clientX;
}

let funct, param;
let year_choice;
let body = document.body;
let option_menu = document.getElementById("options");
let check = document.getElementById("show-menu");

check.addEventListener("change", function () {
   body.style.overflow = this.checked ? "hidden" : "initial";
});

let fetch_in_progess = false;
let resultTags;
 
navLinks.forEach(link => {

   link.addEventListener('click', function () {
      if (fetch_in_progess) {
         return;
      }

      navLinks.forEach(link => {
         link.classList.remove('active')
      });

      this.classList.add('active');

      result.innerHTML = `
      <div class="d-flex justify-content-center w-100">
      <div id="spinner" class="spinner-border mt-2" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
    </div>`;

      switch (this.id) {
         case "leaderboard":
            fun = squadsLeaderboard;
            param = `standings/?season=${yearValue}`;
            resultTags = `
                <table class="table table-sm" id="tableResults">
                    <thead id="thead">
                    </thead>
                    <tbody id="tbody">
                    </tbody>
                </table>
                `;
            break;

         case "scorers":
            fun = scorersLeaderboard;
            param = `scorers/?limit=100&season=${yearValue}`;
            resultTags = `
                <table class="table table-sm" id="tableResults">
                    <thead id="thead">
                    </thead>
                    <tbody id="tbody">
                    </tbody>
                </table>
                `;
            break;

         case "calendar":
            fun = competitionCalendar;
            param = `matches?matchday=1&season=${yearValue}`;
            resultTags = `  
            <div class="d-flex flex-column calendar" id="calendar">
            <div id="header-calendar" class="header-calendar" data-bs-toggle="modal" data-bs-target="#matchdayList" onclick=createModal()>1° MATCHDAY</div>
            <div class="d-flex justify-content-evenly mt-4 mb-3">
              <div id="left-scroll" class="click-area" onclick="scrollCalendar(this)"><i class="fas fa-chevron-circle-left"></i></div>
              <div id="right-scroll" class="click-area" onclick="scrollCalendar(this)"><i class="fas fa-chevron-circle-right"></i></div>
            </div>
            <div id="calendar-area">
      
            </div>
          </div>
        </div>
                `;
            break;

         default:
            break;
      }
   
      if(yearValue != undefined && leagueValue != undefined){
         fetch_in_progess = true;
         fetch(
            `${fixFrameURL}competitions/${leagueValue}/${param}`,
            {
               "method": "GET",
               "headers": {
                  "X-Auth-Token": api_key
               }
            }).then(resp => resp.json()
               .then(output => {
                  result.innerHTML += resultTags;
                  fun(output);
                  let spinner = document.getElementById("spinner");
                  let spinnerContainer = spinner.parentNode;
                  spinnerContainer.removeChild(spinner);
                  fetch_in_progess = false;
               })
               .catch(error => {
                  let spinner = document.getElementById("spinner");
                  let spinnerContainer = spinner.parentNode;
                  spinnerContainer.removeChild(spinner);
                  result.textContent = "An error has been occured! " + error;
                  fetch_in_progess = false;
               }));
      }else{
         result.innerHTML = "Choose a league and a season year";
      }
   });
});

function squadsLeaderboard(output) {
   let thead = document.getElementById("thead");
   let tbody = document.getElementById("tbody");
   let row = document.createElement("tr");
   row.innerHTML =
      `<tr>
        <th colspan="3">Squad</th>
        <th>SG</th>
        <th>CG</th>
        <th>GD</th>
        <th>Points</th>
    </tr>`;
   thead.appendChild(row);
   output.standings[0].table.forEach(element => {
      row = document.createElement("tr");
      row.id = element.team.id;
      row.innerHTML = `
            <td>${element.position}</td>
            <td>
               <img class="img-cell" height="100%" width="100%" src="${element.team.crest}" onerror="defaultImage(this)">
            </td>
            <td>
               ${element.team.shortName}
            </td>
            <td>${element.goalsFor}</td>
            <td>${element.goalsAgainst}</td>
            <td>${element.goalDifference}</td>
            <td>${element.points}</td>
        `;
      tbody.appendChild(row);
   });
}

function scorersLeaderboard(output) {
   let thead = document.getElementById("thead");
   let tbody = document.getElementById("tbody");
   let row = document.createElement("tr");
   row.innerHTML =
      `<tr>
         <th colspan="3">Name</th>
         <th>Goals</th>
      </tr>`;
   let i = 1;
   thead.appendChild(row);
   output.scorers.forEach(element => {
      row = document.createElement("tr");
      row.id = element.team.id;
      row.innerHTML = `
         <td>${i++}</td>
         <td>
            <img class="img-cell" height="100%" width="100%" src="${element.team.crest}" onerror="defaultImage(this)">
         </td>
         <td>
            ${element.player.name}
         </td>
         <td class="goals-column">${element.goals + 0}</td>
       `;
      tbody.appendChild(row);
   });
}

function competitionCalendar(output) {
   let calendar = document.getElementById("calendar-area");
   calendar.innerHTML = `
   <div class="container mt-3">
      <div class="row gx-3 gy-2 align-items-center">
      </div>
   </div>
   `;
   let matchesContainer = document.getElementsByClassName("row gx-3 gy-2 align-items-center");
   let lastMatchesContainer = matchesContainer[matchesContainer.length - 1];
   output.matches.forEach(element => {
      lastMatchesContainer.innerHTML += `
      <div class="col-md-6">
      <div class="p-3 border">
        <div class="match">
          <div class="teams">
            <div class="team home-team">
              <div class="team-info">
                <div class="bordered-image-wrapper">
                  <img class="flag" src="${element.homeTeam.crest}" alt="" onerror="defaultImage(this)"/>
                </div>
                <div class="name">${element.homeTeam.shortName}</div>
              </div>
              <div class="score">${(element.score.fullTime.home == null)?  "" : element.score.fullTime.home}</div>
            </div>
            <div class="team away-team">
              <div class="team-info">
                <div class="bordered-image-wrapper">
                  <img class="flag" src="${element.awayTeam.crest}" alt="" onerror="defaultImage(this)"/>
                </div>
                <div class="name">${element.awayTeam.shortName}</div>
              </div>
              <div class="score">${(element.score.fullTime.away == null)?  "" : element.score.fullTime.away}</div>
            </div>
          </div>
          <div class="match-state">
          </div>
      </div>      
        `;

      let matchState = document.getElementsByClassName("match-state");
      let lastmatchState = matchState[matchState.length - 1];
      let matchDate = new Date(element.utcDate)

      lastmatchState.innerHTML =  `
      <div class="date">${matchDate.getDay() + 1}/${matchDate.getMonth() + 1}/${matchDate.getFullYear()}</div>
      <div class="state">${element.status}</div>`;
      if(element.status != "FINISHED"){
         lastmatchState.innerHTML += `<div class="time">${(matchDate.getHours() / 10 == 0) ? "0" : ""}${matchDate.getHours()}:${((matchDate.getMinutes() / 10) == 0) ? "0" : ""}${matchDate.getMinutes()}</div>
         `;
      }
   });
}

function scrollCalendar(scrollerType) {
   let matchdayHeader = document.getElementById("header-calendar");
   let matchday = parseInt(matchdayHeader.textContent.split("°")[0]);

   if (scrollerType.id == "left-scroll" && matchday - 1 > 0) {
      matchday --;
   }else if (scrollerType.id == "right-scroll" && matchday + 1 <= (document.querySelectorAll(".row > div").length * 2)) {
      matchday ++; 
   }else{
      scrollerType.childNodes[0].classList.add("disabled");
      return;
   }

   let calendar = document.getElementById("calendar-area");
   calendar.classList.add("d-flex");
   calendar.classList.add("justify-content-center");
   calendar.innerHTML = `<div class="spinner-border mt-2" role="status">
   <span class="visually-hidden">Loading...</span>
   </div>`;

   matchdayHeader.textContent = `${matchday}° MATCHDAY`;
   fetch(
      `${fixFrameURL}competitions/${leagueValue}/matches/?matchday=${matchday}&season=${yearValue}`,
      {
         "method": "GET",
         "headers": {
            "X-Auth-Token": api_key
         }
      }).then(resp => resp.json()
         .then(output => {
            calendar.classList.remove("d-flex");
            calendar.classList.remove("justify-content-center");
            competitionCalendar(output);
            let scrollers = document.querySelectorAll('[class^="fas fa-chevron-circle"]');
            console.log(scrollers);
            for (let i = 0 ; i < scrollers.length; i++){
               scrollers[i].classList.remove("disabled");
            }
         })
         .catch(error => {
            console.log("Si è verificato un errore!" + error);
         }));
}

function createModal() {
   let body = document.getElementById("modalBody");
   console.log(body);
   body.innerHTML = "";

   for (let i = 1; i <= (document.querySelectorAll(".col-md-6").length * 2 - 1) * 2; i++) {
      body.innerHTML += `
         <div class="d-flex block matchday-element" id="matchday-${i}" data-bs-toggle="modal" onclick="chooseMatchday(this);">${i}° Matchday</div>
      `;
   }
}

function chooseMatchday(obj){
   let modal = document.getElementById("matchdayList");
   modal.classList.remove("center-modal");
   let matchdayHeader = document.getElementById("header-calendar");
   let calendar = document.getElementById("calendar-area");
   calendar.classList.add("d-flex");
   calendar.classList.add("justify-content-center");
   calendar.innerHTML = `<div class="spinner-border mt-2" role="status">
   <span class="visually-hidden">Loading...</span>
 </div>`;
   fetch(
      `${fixFrameURL}competitions/${leagueValue}/matches/?matchday=${obj.id.split("-")[1]}&season=${yearValue}`,
      {
         "method": "GET",
         "headers": {
            "X-Auth-Token": api_key
         }
      }).then(resp => resp.json()
         .then(output => {
            calendar.classList.remove("d-flex");
            calendar.classList.remove("justify-content-center");
            competitionCalendar(output);
         })
         .catch(error => {
            console.log("Si è verificato un errore!" + error);
         }));
   matchdayHeader.textContent = `${obj.id.split("-")[1]}° MATCHDAY`;
}

function defaultImage(img) {
   img.src = 'images/logo-default.png';
}

function createYearSelect() {
   let year = document.getElementById("year");
   for (let i = 0; i < 3; i++) {
      year.innerHTML += `<li data-value="${new Date().getFullYear() - i}"><a href="#">${new Date().getFullYear() - i}-${new Date().getFullYear() - i + 1}</a></li>`;
   }
}

window.onload = () => {
   createYearSelect();
}