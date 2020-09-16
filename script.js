"use strict";

window.addEventListener("DOMContentLoaded", start);

let students = [];

const endpoint = "https://petlatkea.dk/2020/hogwarts/students.json";

//The prototype for the student data
const Students = {
  firstName: "",
  middleName: null,
  lastName: "",
  nickName: null,
  gender: "",
  image: "",
  house: "",
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
  const response = await fetch(endpoint);
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  students = jsonData.map(prepareObject);
  console.log("Return value", students);

  //TO DO - add buildList(); function
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
    console.log("More than 2", nameParts);

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
    //console.log(student.lastName);
  }

  //nickName
  if (jsonObject.fullname.includes(`"`)) {
    console.log("KIG HER:::");
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

  return student;
}

function selectFilter() {
  console.log("selectFilter");
  const filter = this.dataset.filter;
  console.log(filter);
  filterList(filter);

  //this.classList.toggle("off");
}

function filterList(filter) {
  console.log(students);
  const filteredList = students.filter((student) => {
    if (filter === "*") {
      return true;
    } else {
      return student.house === filter;
    }
  });
  displayList(filteredList);
}

function selectSort() {
  const sort = this.dataset.sort;
  console.log(sort);
  sortList(sort);
}

function sortList(sortBy) {
  let sortedList = students;

  if (sortBy === "firstName") {
    sortedList = sortedList.sort(sortByFirstName);
  }
  if (sortBy === "lastName") {
    sortedList = sortedList.sort(sortByLastName);
  }
  if (sortBy === "house") {
    sortedList = sortedList.sort(sortByHouse);
  }
  // console.log("Running sortList");
  // //const list = students;
  // console.log("list", list);
  // const sortedList = list.sort(sortByLastName);
  displayList(sortedList);
}

function sortByFirstName(a, b) {
  if (a.firstName < b.firstName) {
    return -1;
  } else {
    return 1;
  }
}

function sortByHouse(a, b) {
  if (a.house < b.house) {
    return -1;
  } else {
    return 1;
  }
}
function sortByLastName(a, b) {
  if (a.lastName < b.lastName) {
    return -1;
  } else {
    return 1;
  }
}

function buildList() {
  console.log("Running buildList");
  const currentList = students; // FUTURE: SORT and Filter list

  displayList(currentList);
}

// The section where all students are appended in the loop-view
const dataContainer = document.querySelector("#data-container");

function displayList(students) {
  console.log("Running displayList");
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
  clone.querySelector(
    "#house-crest-loop"
  ).src = `images/house_crests/${student.house}.svg`;
  if (student.middleName === null && student.nickName === null) {
    clone.querySelector("#name-display-large").textContent = student.firstName;
    clone.querySelector("#name-display-small").textContent = student.lastName;
  } else if (student.middleName != null && student.nickName === null) {
    clone.querySelector("#name-display-large").textContent = student.firstName;
    clone.querySelector(
      "#name-display-small"
    ).textContent = `${student.middleName} ${student.lastName}`;
  } else if (student.middleName === null && student.nickName != null) {
    clone.querySelector("#name-display-large").textContent = student.firstName;
    clone.querySelector(
      "#name-display-small"
    ).textContent = `${student.nickName} ${student.lastName}`;
  } else if (student.middleName != null && student.nickName != null) {
    clone.querySelector("#name-display-large").textContent = student.firstName;
    clone.querySelector(
      "#name-display-small"
    ).textContent = `"${student.nickName}" ${student.lastName}`;
  }
  clone
    .querySelector("#loop-view")
    .addEventListener("click", () => showPopUp(student));
  // append clone to list
  dataContainer.appendChild(clone);
}

function showPopUp(student) {
  console.log("Running showPopUp", student);
}

String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.substring(1).toLowerCase();
};

// EKSPERIMENT!!
// String.prototype.middleNamesCap = function () {
//   return this.map((i) => i.capitalize());
// };

// const names = ["frede", "svendsen", "jørgensen", "pedersen"];
// console.log(names.map((i) => i.capitalize()));

// console.log(names.middleNamesCap());

/// --- BUTTONS EVENTLISTENERS START ---  ///

/// --- BUTTONS EVENTLISTENERS START ---  ///

/// --- FILTERING ---  ///
