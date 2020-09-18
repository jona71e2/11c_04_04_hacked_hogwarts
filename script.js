"use strict";

window.addEventListener("DOMContentLoaded", start);

let students = [];
let expel = [];
let inquisitorial = [];

const endpoint1 = "https://petlatkea.dk/2020/hogwarts/students.json";
const endpoint2 = "https://petlatkea.dk/2020/hogwarts/families.json";

//The prototype for the student data
const Students = {
  firstName: "",
  middleName: null,
  lastName: "",
  nickName: null,
  gender: "",
  image: "",
  house: "",
  expel: false,
  inquisitorial: false,
};

const settings = {
  filter: "*",
  sort: "",
  sortDir: "asc",
};

function start() {
  console.log("Program running");
  loadJSON();
  registerButtons();
}

function registerButtons() {
  const buttonsFilter = document.querySelectorAll("[data-action='filter']");
  const buttonsSort = document.querySelectorAll("[data-action='sort']");

  buttonsFilter.forEach((btn) => {
    btn.addEventListener("click", selectFilter);
  });
  buttonsSort.forEach((btn) => {
    btn.addEventListener("click", selectSort);
  });
}

async function loadJSON() {
  const response = await fetch(endpoint1);
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  students = jsonData.map(prepareObject);

  buildList();
}

function prepareObject(jsonObject) {
  const student = Object.create(Students);

  //firstName
  //Split the fullname-string from the json-file by every space.
  const nameParts = jsonObject.fullname.trim().split(" ");

  //Set student firstName to be the first index of the nameParts-array
  student.firstName = nameParts[0].capitalize();

  //middleName
  if (nameParts.length > 2) {
    ///// --- TEST: Make a middleNames array using the slice() method,
    ///and capitalize each item using map() and String.prototype.capitalize
    const middleNames = [...nameParts].slice(1, nameParts.length - 1);

    const capitalizeMiddleNames = middleNames.map((i) => i.capitalize());

    student.middleName = capitalizeMiddleNames.join(" ");
  }

  //lastName
  //Set the student lastName to be the last index of the namePart-array
  student.lastName = nameParts[nameParts.length - 1].capitalize();
  //Check if the last name includes a dash. If so, then create two substrings and capitalize both
  if (student.lastName.includes("-")) {
    student.lastName =
      nameParts[1].substring(0, nameParts[1].indexOf("-") + 1).capitalize() +
      student.lastName
        .substring(student.lastName.indexOf("-") + 1)
        .capitalize();
  }

  //nickName
  if (jsonObject.fullname.includes(`"`)) {
    student.nickName = jsonObject.fullname.substring(
      jsonObject.fullname.indexOf(`"`) + 1,
      jsonObject.fullname.lastIndexOf(`"`)
    );
  }

  student.gender = jsonObject.gender.trim().toLowerCase();

  student.house = jsonObject.house.trim().toLowerCase();

  student.image = `${student.lastName.toLowerCase()}_${student.firstName
    .substring(0, 1)
    .toLowerCase()}.png`;
  if (student.image.includes("-")) {
    student.image = `${student.lastName
      .substring(student.lastName.indexOf("-") + 1)
      .toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  }
  if (student.image.includes("patil")) {
    student.image = `${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  }
  if (student.image.includes("leanne")) {
    student.image = `granger_h.png`;
  }

  return student;
}

function selectFilter() {
  document.querySelectorAll(".name").forEach((p) => {
    p.classList.remove("sorting-prop");
  });
  const filter = this.dataset.filter;
  setFilter(filter);

  //this.classList.toggle("off");
}

function setFilter(filter) {
  settings.filter = filter;
  buildList();
}

function filterList(filteredList) {
  filteredList = students.filter((student) => {
    if (settings.filter === "*") {
      return true;
    } else {
      return settings.filter === student.house;
    }
  });
  console.log(filteredList);
  return filteredList;
}

function selectSort(event) {
  const sortProp = this.dataset.sort;
  const sortDir = this.dataset.sortDirection;

  if (sortDir == "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  setSort(sortProp, sortDir);
}

function setSort(sortProp, sortDir) {
  settings.sort = sortProp;
  settings.sortDir = sortDir;
  buildList();
}

function sortList(list) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }
  const sortedList = list.sort(sortByProp);
  function sortByProp(a, b) {
    if (a[settings.sort] < b[settings.sort]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

function buildList() {
  // console.log("Running buildList");
  const currentList = filterList(students);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

// The section where all students are appended in the loop-view
const dataContainer = document.querySelector("#data-container");

function displayList(students) {
  //Clear the list
  dataContainer.innerHTML = "";

  //build a new list
  students.forEach(displayStudent);
}

function displayStudent(student) {
  console.log("Running displayStudent");
  //Create clone
  const clone = document
    .querySelector("template#student-template")
    .content.cloneNode(true);

  //Clone data
  const firstNameSelector = clone.querySelector("#firstname-display");
  const lastNameSelector = clone.querySelector("#lastname-display");
  const middleNameSelector = clone.querySelector("#middlename-display");
  const nickNameSelector = clone.querySelector("#nickname-display");

  clone.querySelector("#image-loop").src = `images/students/${student.image}`;
  clone.querySelector(
    "#house-crest-loop"
  ).src = `images/house_crests/${student.house}.svg`;
  if (student.middleName === null && student.nickName === null) {
    firstNameSelector.textContent = student.firstName;
    lastNameSelector.textContent = student.lastName;
  } else if (student.middleName != null && student.nickName === null) {
    firstNameSelector.textContent = student.firstName;
    middleNameSelector.textContent = student.middleName;
    lastNameSelector.textContent = student.lastName;
  } else if (student.middleName === null && student.nickName != null) {
    firstNameSelector.textContent = student.firstName;
    nickNameSelector.textContent = student.nickName;
    lastNameSelector.textContent = student.lastName;
  } else if (student.middleName != null && student.nickName != null) {
    firstNameSelector.textContent = student.firstName;
    middleNameSelector.textContent = student.middleName;
    nickNameSelector.textContent = student.nickName;
    lastNameSelector.textContent = student.lastName;
  }
  if (settings.sort === "firstName") {
    firstNameSelector.classList.add("sorting-property");
  }
  if (settings.sort === "lastName") {
    lastNameSelector.classList.add("sorting-property");
  }

  clone
    .querySelector("#inquisitorial")
    .addEventListener("click", () => addStudentToInquisitorial(student));
  function addStudentToInquisitorial(student) {
    console.log("Inquisitorial", student);
    if (student.inquisitorial === false) {
      student.inquisitorial = true;
    } else {
      student.inquisitorial = false;
    }
    console.log(student.inquisitorial);
    inquisitorial.push(student);
    inquisitorialList();
  }
  clone
    .querySelector("#expel")
    .addEventListener("click", () => expelStudent(student));
  function expelStudent(student) {
    console.log("EXPELLING YOU", student);
    student.expel = true;
    console.log(student.expel);
    expelledList();
  }

  clone
    .querySelector("#person-loop-container")
    .addEventListener("click", () => showPopUp(student));
  // append clone to list
  dataContainer.appendChild(clone);
}

function inquisitorialList() {
  console.log("inquisitorialList");
  const inquisitorialList = students.filter((student) => {
    if (student.inquisitorial === true) {
      return true;
    } else {
      return false;
    }
  });
  inquisitorial = inquisitorialList;
  console.log(inquisitorialList, ":::::::");
  console.log(inquisitorial, "GLOBAL");
}

function expelledList() {
  console.log("expelledList");
  const expelList = students.filter((student) => {
    if (student.expel === true) {
      return true;
    } else {
      return false;
    }
  });
  expel = expelList;
  console.log(expelList, ":::::::");
  console.log(expel, "EXPEL ... --- GLOBAL");
}

function showPopUp(student) {
  console.log("Running showPopUp", student);
  const popUp = document.querySelector("#pop-up");
  popUp.classList.remove("hide");
  popUp
    .querySelector("button")
    .addEventListener("click", () => popUp.classList.add("hide"));

  let namePopUp = document.querySelector("#name-pop-up");
  if (student.middleName === null && student.middleName === null) {
    namePopUp.textContent = `${student.firstName} ${student.lastName}`;
  } else if (student.middleName !== null) {
    namePopUp.textContent = `${student.firstName} ${student.middleName} ${student.lastName}`;
  } else if (student.nickName !== null) {
    namePopUp.textContent = `${student.firstName} ${student.nickName} ${student.lastName}`;
  }

  document.querySelector(
    "#housecrest-pop-up"
  ).src = `images/house_crests/${student.house}.svg`;
  document.querySelector(
    "#student-img-pop-up"
  ).src = `images/students/${student.image}`;
}

function searchStudent(searchString, students) {
  console.log("running searchStudent");
  return students.filter((search) => {
    const regex = new RegExp(searchString, "gi");
    if (search.middleName === null) {
      search.middleName = "";
    }
    return (
      search.firstName.match(regex) ||
      search.lastName.match(regex) ||
      search.middleName.match(regex)
      //search.house.match(regex) ||
      //search.gender.match(regex)
    );
  });
}

function searchValues() {
  console.log("Running seachValues");
  console.log(this.value);
  const searchString = this.value;
  console.log(searchString);
  //searchStudent(searchString, students);
  const searchResult = searchStudent(searchString, students);
  displayList(searchResult);
}

const searchInput = document.querySelector(".search");
searchInput.addEventListener("input", searchValues);

String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.substring(1).toLowerCase();
};

// EKSPERIMENT!!
// Array.prototype.middleNamesCap = function () {
//   return this.map((i) => i.capitalize());
// };

// const names = ["frede", "svendsen", "jørgensen", "pedersen"];
// console.log(names.map((i) => i.capitalize()));

// console.log(names.middleNamesCap());

/// --- BUTTONS EVENTLISTENERS START ---  ///

/// --- BUTTONS EVENTLISTENERS START ---  ///

/// --- FILTERING ---  ///
