//@ts-ignore

let launches = [];

const numberHeading = "No.".padStart(5);
const dateHeading = "Date".padEnd(15);
const missionHeading = "Mission".padEnd(25);
const rocketHeading = "Rocket".padEnd(22);
const targetHeading = "Destination";
const customersHeading = "Customers";

function initValues() {
  const today = new Date().toISOString().split("T")[0];
  const launchDaySelector = document.getElementById("launch-day");
  launchDaySelector.setAttribute("min", today);
  launchDaySelector.setAttribute("value", today);
}

const loadLaunches = async () => {
  // TODO: Once API is ready.
  // Load launches and sort by flight number.

  const launchRes = await fetch("/launches");

  const launchData = await launchRes.json();

  launches = launchData.sort((a, b) => a.flightNumber < b.flightNumber);

}

function loadPlanets() {

  const getData = async () => {
    const res = await fetch ("/planets");
    
    const data = await res.json();

    const planetSelector = document.getElementById("planets-selector");
    data.forEach((planet) => {
    planetSelector.innerHTML += `<option value="${planet.kepler_name}">${planet.kepler_name}</option>`;
  });
    
  };

  getData();
  

}

const abortLaunch = async (id) => {
    const deleteLaunch = fetch(`/launches/${id}`, {
      method: "delete"
    });

    const res = await deleteLaunch;

    if (res) {
      loadLaunches;
      listUpcoming;
    }
}

const submitLaunch = async () => {
  const target = document.getElementById("planets-selector").value;
  const launchDate = new Date(document.getElementById("launch-day").value);
  const mission = document.getElementById("mission-name").value;
  const rocket = document.getElementById("rocket-name").value;
  const flightNumber = launches[launches.length - 1]?.flightNumber + 1 || 1;

  const submitData = fetch("/launches", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      launchDate: Math.floor(launchDate / 1000),
      flightNumber,
      mission,
      rocket,
      target
    })
  });

  const res = await submitData;

  if (res) {
    loadLaunches();
    document.getElementById("launch-success").hidden = false;
  } 
}

function listUpcoming() {
  const upcomingList = document.getElementById("upcoming-list");
  upcomingList.innerHTML = `<div class="list-heading">${numberHeading} ${dateHeading} ${missionHeading} ${rocketHeading} ${targetHeading}</div>`;
  launches
    .filter((launch) => launch.upcoming)
    .forEach((launch) => {
      const launchDate = new Date(launch.launchDate * 1000).toDateString();
      const flightNumber = String(launch.flightNumber).padEnd(3);
      const mission = launch.mission.slice(0, 25).padEnd(25);
      const rocket = launch.rocket.padEnd(22);
      const target = launch.target ?? "";
      upcomingList.innerHTML += `<div class="list-item"><a class="delete" onclick="abortLaunch(${launch.flightNumber})">✖</a> ${flightNumber} <span class="silver">${launchDate}</span> ${mission} <span class="silver">${rocket}</span> <span class="gold">${target}</span></div>`;
    });
}

function listHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = `<div class="list-heading">${numberHeading} ${dateHeading} ${missionHeading} ${rocketHeading} ${customersHeading}</div>`;
  launches
    .filter((launch) => !launch.upcoming)
    .forEach((launch) => {
      const success = launch.success ? `<span class="success">█</span>` : `<span class="failure">█</span>`;
      const launchDate = new Date(launch.launchDate * 1000).toDateString();
      const flightNumber = String(launch.flightNumber).padEnd(3);
      const mission = launch.mission.slice(0, 25).padEnd(25);
      const rocket = launch.rocket.padEnd(22);
      const customers = launch.customers.join(", ").slice(0, 27);
      historyList.innerHTML += `<div class="list-item">${success} ${flightNumber} <span class="silver">${launchDate}</span> ${mission} <span class="silver">${rocket}</span> ${customers}</div>`;
    });
}

function navigate(navigateTo) {
  const pages = ["history", "upcoming", "launch"];
  document.getElementById(navigateTo).hidden = false;
  pages.filter((page) => page !== navigateTo).forEach((page) => {
    document.getElementById(page).hidden = true;
  })
  document.getElementById("launch-success").hidden = true;

  if (navigateTo === "upcoming") {
    loadLaunches();
    listUpcoming();
  } else if (navigateTo === "history") {
    loadLaunches();
    listHistory();
  }
}

window.onload = () => {
  initValues();
  loadLaunches();
  loadPlanets();
};