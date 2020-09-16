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
}

async function loadJSON() {
  const response = await fetch(endpoint);
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  console.log(jsonData);
  students = jsonData.map(prepareObject);
  console.log("Return value", students);

  //TO DO - add buildList(); function
  buildList();
}

function prepareObject(jsonObject) {
  console.log("PrepareObject", jsonObject);
  const student = Object.create(Students);

  //firstName
  //Split the fullname-string from the json-file by every space.
  const nameParts = jsonObject.fullname.trim().split(" ");
  console.log("NameParts", nameParts.length);
  //Set student firstName to be the first index of the nameParts-array
  student.firstName = nameParts[0].capitalize();

  //middleName
  // if (nameParts.length > 2 && nameParts.length < 4) {
  //   student.middleName = nameParts[1].capitalize();
  // }
  if (nameParts.length > 2) {
    console.log("More than 2", nameParts);
    const middleNames = [...nameParts].splice(1).shift();
    console.log(":::MIDDLE NAMES", middleNames);

    student.middleName = middleNames.capitalize();
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

  student.gender = jsonObject.gender.trim().capitalize();

  student.house = jsonObject.house.trim().capitalize();

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

function buildList() {
  console.log("Running buildList");
  const currentList = students; // FUTURE: SORT and Filter list

  displayList(currentList);
}

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

//// EKSPERIMENT!!
// String.prototype.middleNamesCap = function () {
//   return this.map((i) => i.capitalize());
// };

// const names = ["frede", "svendsen", "jørgensen", "pedersen"];
// console.log(names.map((i) => i.capitalize()));

// console.log(names.middleNamesCap());

const buttons = document.querySelectorAll("button");

buttons.forEach((btn) => {
  btn.addEventListener("click", clickBtn);

  function clickBtn() {
    console.log("CLICK");
    this.classList.toggle("off");
  }
});
