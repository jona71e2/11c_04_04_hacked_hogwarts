"use strict";

window.addEventListener("DOMContentLoaded", start);

let students = [];
let expel = [];
let inquisitorial = [];

let hasBeenHacked = false;

// const endpoint1 = "https://petlatkea.dk/2020/hogwarts/students.json";
// const endpoint2 = "https://petlatkea.dk/2020/hogwarts/families.json";

loadJSON("https://petlatkea.dk/2020/hogwarts/students.json", prepareObjects);
loadJSON("https://petlatkea.dk/2020/hogwarts/families.json", prepareBlood);

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
  bloodStatus: "set status",
  prefect: false,
};

const settings = {
  filter: "*",
  sort: "",
  sortDir: "asc",
};

function start() {
  console.log("Program running");
  //loadJSON();
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

async function loadJSON(url, callback) {
  const response = await fetch(url);
  const jsonData = await response.json();

  // when loaded, prepare data objects
  callback(jsonData);
}

function prepareObjects(jsonData) {
  students = jsonData.map(prepareObject);

  buildList();
}

function prepareBlood(jsonData) {
  // Fetching the second json-file is made with Daniel
  //console.log(jsonData);
  const jsonBlood = jsonData;
  //console.log(jsonBlood, "JSON 2");
  // students = jsonData.map(prepareObject);
  students.forEach((student) => {
    //console.log(student);
    if (jsonBlood.pure.includes(student.lastName)) {
      student.bloodStatus = "pure";
    } else if (jsonBlood.half.includes(student.lastName)) {
      student.bloodStatus = "half";
    } else {
      student.bloodStatus = "muggle";
    }
  });
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
  //console.log(filteredList);
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
  //console.log(sortedList);

  //UPDATING THE ABOUT NUMBERS:
  document.querySelector(
    ".about .total-number"
  ).textContent = `Number of students: ${students.length}`;
  document.querySelector(
    ".about .expelled-number"
  ).textContent = `Number of expelled students: ${expel.length}`;
  document.querySelector(
    ".about .number-by-house"
  ).textContent = `Students by house: Gryffindor: ${
    students.filter((student) => student.house === "gryffindor").length
  }, Hufflepuff: ${
    students.filter((student) => student.house === "hufflepuff").length
  }, Ravenclaw: ${
    students.filter((student) => student.house === "ravenclaw").length
  }, Slytherin: ${
    students.filter((student) => student.house === "slytherin").length
  }`;

  //This does not work when typing something in the search input.
  document.querySelector(
    ".about .currently-displayed"
  ).textContent = `Number of students currently displayed: ${sortedList.length}`;

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
  //console.log("Running displayStudent");
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

  //INQUISITORIAL

  //Makes sure, that the iquisitorial-button is checked
  //after filtering and sorting - if the student is on the inquis. squad.
  if (student.inquisitorial === true) {
    clone.querySelector("#inquisitorial").checked = true;
  }

  //Eventlistener on inqusitorial button
  clone
    .querySelector("#inquisitorial")
    .addEventListener("click", () => clickInquisitorialButton(student));

  function clickInquisitorialButton(student) {
    // if (hasBeenHacked) {
    //   setTimeout (removeFromInqSquat, 2000, student);
    // MAKE removeFromInqSquat function
    // }
    checkInquisitorialStatus(student);
  }

  // PREFECTS

  //Makes sure, that the prefect-button is checked
  //after filtering and sorting - if the student is a prefect.
  if (student.prefect === true) {
    clone.querySelector("#prefect").checked = true;
  }
  //Eventlistener on prefect button
  clone
    .querySelector("#prefect")
    .addEventListener("click", () => clickPrefectButton(student));

  function clickPrefectButton(student) {
    console.log("PREFECT", student);
    checkPrefectStatus(student);
  }

  //Eventlistener on expel button
  clone
    .querySelector("#expel")
    .addEventListener("click", () => clickExpelButton(student));
  function clickExpelButton(student) {
    console.log("EXPELLING YOU", student);
    expelStudent(student);
  }

  clone
    .querySelector("#person-loop-container")
    .addEventListener("click", () => showPopUp(student));
  // append clone to list
  dataContainer.appendChild(clone);
}

function checkInquisitorialStatus(student) {
  console.log("Running checkInquisitorialStatus", student);
  if (student.inquisitorial === true) {
    student.inquisitorial = false;
    inquisitorial.splice(inquisitorial.indexOf(student), 1);
    console.log("Removed from inquis", inquisitorial);
  } else {
    checkInquisitorialRequirements(student);
  }
  console.log(student);
}

function checkInquisitorialRequirements(student) {
  console.log("STUDENTER CHECK::::", student);
  if (student.house === "slytherin" || student.bloodStatus === "pure") {
    student.inquisitorial = true;
    //inquisitorial.push(student);
    inquisitorialList();
  } else {
    checkCheckBoxes();
  }
}

function checkPrefectStatus(student) {
  console.log("Running checkPrefectStatus", student);
  if (student.prefect === true) {
    student.prefect = false;
  } else {
    checkPrefectRequirements(student);
  }
}

function checkPrefectRequirements(student) {
  console.log("Running checkPrefectRequirements");
  // Checks if there is already a prefect that matches both
  // house and gender
  // if not: make student a prefect
  // if there is already one: ignore or remove the existing prefect

  //Filtering for all prefects
  const prefects = students.filter((student) => student.prefect);
  console.log("Prefect filtered list:", prefects);

  //Filtering the list of all prefects to find prefects
  // who matches both house and gender of the selected student
  const otherMathingPrefects = prefects
    .filter(
      (prefect) =>
        prefect.gender === student.gender && prefect.house === student.house
    )
    .shift();
  console.log(otherMathingPrefects);

  if (otherMathingPrefects === undefined) {
    makePrefect(student);
  } else {
    // Ask the user to either:
    //Remove the existing prefect and add the selected
    //OR
    //Ignore

    document.querySelector("#prefect-warning").classList.remove("hide");

    //Adding eventlisteners to the buttons (user-choises) inside the dialog
    document
      .querySelector("#prefect-warning .modal-close")
      .addEventListener("click", closeDialog);
    document
      .querySelector("#prefect-warning #make-new-prefect")
      .addEventListener("click", clickNewPrefect);
    document
      .querySelector("#prefect-warning #keep-current-prefect")
      .addEventListener("click", clickCurrentPrefect);

    function closeDialog() {
      document.querySelector("#prefect-warning").classList.add("hide");
      document
        .querySelector("#prefect-warning .modal-close")
        .removeEventListener("click", closeDialog);
      document
        .querySelector("#prefect-warning #make-new-prefect")
        .removeEventListener("click", clickNewPrefect);
      document
        .querySelector("#prefect-warning #keep-current-prefect")
        .removeEventListener("click", clickCurrentPrefect);
      buildList();
    }

    function clickNewPrefect() {
      console.log("Running clickNewPrefect");
      makePrefect(student);
      removePrefect(otherMathingPrefects);
      closeDialog();
      buildList();
    }

    function clickCurrentPrefect() {
      console.log("Running clickCurrentPrefect");
      makePrefect(otherMathingPrefects);
      closeDialog();
      buildList();
    }

    //Adding text to the dialog box
    document.querySelector(
      "#prefect-warning .dialog-message"
    ).textContent = `Only one ${
      student.gender
    } from ${student.house.capitalize()} can be prefect.
      Do you want to make ${student.firstName} a prefect or keep ${
      otherMathingPrefects.firstName
    }?`;

    console.log(`Only one ${
      student.gender
    } from ${student.house.capitalize()} can be prefect.
    Do you want to add ${student.firstName} or keep ${
      otherMathingPrefects.firstName
    }?`);

    //Adding text to the buttons inside dialog
    document.querySelector(
      "#prefect-warning #make-new-prefect"
    ).textContent = `Make ${student.firstName} prefect`;
    document.querySelector(
      "#prefect-warning #keep-current-prefect"
    ).textContent = `Keep ${otherMathingPrefects.firstName}`;
  }

  function removePrefect(other) {
    console.log("Running removePrefect - other", other);
    other.prefect = false;
    console.log("From removed Function:", prefects);
  }
  function makePrefect(student) {
    console.log("Running makePrefect");
    student.prefect = true;
  }
}

function expelStudent(student) {
  console.log("expelStudent", student);
  student.expel = true;
  console.log(student.expel);
  //Adding the expelled student to the global array of expelled students
  expel.push(student);
  //Expelling from the students list
  students.splice(students.indexOf(student), 1);
  console.log(students);

  setTimeout(buildList, 1500);
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
  console.log(inquisitorial, "GLOBAL inquisisisis");
}

// function expelledList() {
//   console.log("expelledList");
//   const expelList = students.filter((student) => {
//     if (student.expel === true) {
//       return true;
//     } else {
//       return false;
//     }
//   });
//   expel = expelList;
//   console.log(expelList, ":::::::");
//   console.log(expel, "EXPEL ... --- GLOBAL");
// }

function showPopUp(student) {
  console.log("Running showPopUp", student);
  const popUp = document.querySelector("#pop-up");
  popUp.classList.remove("hide");
  popUp
    .querySelector("button")
    .addEventListener("click", () => popUp.classList.add("hide"));

  const namePopUp = document.querySelector("#detail-view .name");
  if (student.middleName === null && student.middleName === null) {
    namePopUp.textContent = `Name: ${student.firstName} ${student.lastName}`;
  } else if (student.middleName !== null) {
    namePopUp.textContent = `Name: ${student.firstName} ${student.middleName} ${student.lastName}`;
  } else if (student.nickName !== null) {
    namePopUp.textContent = `Name: ${student.firstName} ${student.nickName} ${student.lastName}`;
  }

  document.querySelector(
    "#detail-view .house"
  ).textContent = `House: ${student.house.capitalize()}`;

  document.querySelector(
    "#detail-view .bloodtype"
  ).textContent = `Blood-status: ${student.bloodStatus.capitalize()}`;

  if (student.prefect === true) {
    document.querySelector(
      "#detail-view .prefect"
    ).textContent = `Prefect: Yes`;
  } else {
    document.querySelector("#detail-view .prefect").textContent = `Prefect: No`;
  }

  if (student.inquisitorial === true) {
    document.querySelector(
      "#detail-view .inquisitorial"
    ).textContent = `Part of Inquisitorial Squad: Yes`;
  } else {
    document.querySelector(
      "#detail-view .inquisitorial"
    ).textContent = `Part of Inquisitorial Squad: No`;
  }

  if (student.expel === true) {
    document.querySelector(
      "#detail-view .expelled"
    ).textContent = `${student.firstName} is expelled: Yes`;
  } else {
    document.querySelector(
      "#detail-view .expelled"
    ).textContent = `${student.firstName} is expelled: No`;
  }

  // Setting the images for stundent and housecrest
  document.querySelector(
    "#housecrest-pop-up"
  ).src = `images/house_crests/${student.house}.svg`;
  document.querySelector(
    "#student-img-pop-up"
  ).src = `images/students/${student.image}`;
}

//SEARCHING: This part is inspired by a javascript-course from this page:
//https://javascript30.com/ - day 6 "Ajax Type Ahead"

//Input from search field
const searchInput = document.querySelector(".search");
searchInput.addEventListener("input", searchValues);

function searchValues() {
  console.log("Running seachValues");
  console.log(this.value);
  //Storing the search input
  const searchString = this.value;
  console.log(searchString);
  //Calling the searchStudent function with the searchString
  //and the global students array.
  const searchResult = searchStudent(searchString, students);
  //Calling the displayList function with the return-value
  //from the call above.
  displayList(searchResult);
}

function searchStudent(searchString, students) {
  console.log("running searchStudent");
  //Filtering the students array - using the new RegExp function,
  //parsing the searchString from the searchValues-function as argument.
  return students.filter((search) => {
    const regex = new RegExp(searchString, "gi");
    //making sure that the middleName doesn't return undefined.
    if (search.middleName === null) {
      search.middleName = "";
    }
    //Returning matches for either firstName, lastName, middleName, house or gender
    return (
      search.firstName.match(regex) ||
      search.lastName.match(regex) ||
      search.middleName.match(regex) ||
      search.house.match(regex) ||
      search.gender.match(regex)
    );
  });
}

// String prototype - to capitalize first letter in a string.
String.prototype.capitalize = function () {
  return this[0].toUpperCase() + this.substring(1).toLowerCase();
};

// EKSPERIMENT!!
// Array prototype intended to map over an array,
// and capitalize every item. (In case, there is more than one middleName e.g.)
// Array.prototype.middleNamesCap = function () {
//   return this.map((i) => i.capitalize());
// };

// const names = ["frede", "svendsen", "jørgensen", "pedersen"];
// console.log(names.map((i) => i.capitalize()));

// console.log(names.middleNamesCap());

/// --- BUTTONS EVENTLISTENERS START ---  ///

/// --- BUTTONS EVENTLISTENERS START ---  ///

/// --- FILTERING ---  ///

// expel:::
// students.splice(student,1);

function hackTheSystem() {
  hasBeenHacked = true;

  // Inject yourself

  // - create an object - from student prototype

  const hackerMe = Object.create(Students);
  hackerMe.firstName = "Jonas";
  hackerMe.lastName = "Bøgh";
  hackerMe.gender = "boy";
  hackerMe.house = "gryffindor";
  hackerMe.bloodStatus = "half";
  hackerMe.bloodStatus = "half";
  hackerMe.prefect = true;
  hackerMe.inquisitorial = false;

  //myself.firstName = //
  //myself.prop1 = //
  //myself.prop2 = //
  //myself.hacker = true;

  // Randomize blood-statuses
  students.forEach((student) => {
    if (student.bloodStatus === "pure") {
      //Different ways to write the same thing:

      const random = Math.floor(Math.random() * values.length);

      const values = ["pure", "half", "muggle"];

      student.bloodStatus = values[random];
      // shortHand:::: student.bloodStatus = values[Math.floor(Math.random()* values.length)];

      if (random === 0) {
        student.bloodStatus = "half";
      }
      if (random === 1) {
        student.bloodStatus = "pure";
      }
      if (random === 2) {
        student.bloodStatus = "muggle";
      }
    }
  });

  function expel(student) {
    if (student.hacker === true) {
      // CODE  - Cannot expel
    } else {
      // CODE
    }
  }
}

function checkCheckBoxes() {
  console.log("Running checkCheckBoxes");
  let checkBoxes = document.querySelectorAll("#inquisitorial");
  for (let i = 0; i < checkBoxes.length; i++) {
    if (students[i].inquisitorial === true) {
      checkBoxes[i].checked = true;
    } else {
      checkBoxes[i].checked = false;
    }
  }
}
