const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const greeting = document.getElementById("greeting");
const popupOverlay = document.getElementById("popupOverlay");
const popupMessage = document.getElementById("popupMessage");
const closePopupBtn = document.getElementById("closePopupBtn");
const attendeeListEl = document.getElementById("attendeeList");

let maxCount = 50;
let attendeeCount = 0;
let teamCounts = {
  water: 0,
  zero: 0,
  power: 0,
};
let attendees = [];

function saveProgress() {
  const data = {
    attendeeCount: attendeeCount,
    teamCounts: teamCounts,
    attendees: attendees,
  };
  localStorage.setItem("intelCheckInData", JSON.stringify(data));
}

function loadProgress() {
  const savedData = localStorage.getItem("intelCheckInData");
  if (!savedData) {
    return;
  }

  try {
    const parsed = JSON.parse(savedData);
    if (typeof parsed.attendeeCount === "number") {
      attendeeCount = parsed.attendeeCount;
    }
    if (parsed.teamCounts && typeof parsed.teamCounts === "object") {
      teamCounts.water = parsed.teamCounts.water || 0;
      teamCounts.zero = parsed.teamCounts.zero || 0;
      teamCounts.power = parsed.teamCounts.power || 0;
    }
    if (Array.isArray(parsed.attendees)) {
      attendees = parsed.attendees;
    }
  } catch (error) {
    console.error("Error loading saved progress:", error);
  }
}

function updateProgressUI() {
  attendeeCountEl.textContent = attendeeCount;
  const percentage = Math.min(
    100,
    Math.round((attendeeCount / maxCount) * 100),
  );
  progressBar.style.width = percentage + "%";
}

function updateTeamCounters() {
  document.getElementById("waterCount").textContent = teamCounts.water;
  document.getElementById("zeroCount").textContent = teamCounts.zero;
  document.getElementById("powerCount").textContent = teamCounts.power;
}

function renderAttendeeList() {
  attendeeListEl.innerHTML = "";
  attendees.forEach(function (attendee) {
    var listItem = document.createElement("li");
    listItem.className = "attendee-list-item";
    listItem.innerHTML =
      "<span>" +
      attendee.name +
      "</span><span>" +
      attendee.teamName +
      "</span>";
    attendeeListEl.appendChild(listItem);
  });
}

function showPopup(message) {
  popupMessage.textContent = message;
  popupOverlay.classList.add("visible");
  popupOverlay.setAttribute("aria-hidden", "false");
}

function hidePopup() {
  popupOverlay.classList.remove("visible");
  popupOverlay.setAttribute("aria-hidden", "true");
}

function displayGreeting(name, teamName) {
  greeting.textContent = "Welcome, " + name + " from " + teamName + ".";
  greeting.className = "success-message";
  greeting.style.display = "block";
}

function showCelebration() {
  var winningTeam = "";
  var maxTeamCount = Math.max(
    teamCounts.water,
    teamCounts.zero,
    teamCounts.power,
  );
  if (maxTeamCount === teamCounts.water) {
    winningTeam = "Team Water Wise";
  }
  if (maxTeamCount === teamCounts.zero) {
    if (winningTeam) {
      winningTeam = winningTeam + " and Team Net Zero";
    } else {
      winningTeam = "Team Net Zero";
    }
  }
  if (maxTeamCount === teamCounts.power) {
    if (winningTeam) {
      winningTeam = winningTeam + " and Team Renewables";
    } else {
      winningTeam = "Team Renewables";
    }
  }

  if (winningTeam) {
    showPopup("Goal reached! " + winningTeam + " is leading the celebration.");
    greeting.textContent =
      "Goal reached! " + winningTeam + " is leading the celebration.";
    greeting.className = "success-message celebration";
    greeting.style.display = "block";
  }
}

closePopupBtn.addEventListener("click", function () {
  hidePopup();
});

popupOverlay.addEventListener("click", function (event) {
  if (event.target === popupOverlay) {
    hidePopup();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  var name = nameInput.value.trim();
  var team = teamSelect.value;
  var teamName = teamSelect.selectedOptions[0].text;

  if (!name || !team) {
    showPopup("Please enter a name and select a team before checking in.");
    return;
  }

  attendeeCount = attendeeCount + 1;
  teamCounts[team] = teamCounts[team] + 1;
  attendees.push({ name: name, teamName: teamName });

  updateProgressUI();
  updateTeamCounters();
  renderAttendeeList();
  saveProgress();
  displayGreeting(name, teamName);

  if (attendeeCount >= maxCount) {
    showCelebration();
  } else {
    showPopup(
      "Checked in " +
        name +
        " from " +
        teamName +
        ". Total attendees: " +
        attendeeCount +
        ".",
    );
  }

  form.reset();
});

loadProgress();
updateProgressUI();
updateTeamCounters();
renderAttendeeList();
