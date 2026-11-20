import {
  doSearchNS,
  showNoResultsFound,
  saveIntToStorage,
  readIntFromStorage,
  saveBoolToStorage,
  readBoolFromStorage,
  setupExpandables,
  showPokemonIVs,
  showPokemonInformation,
  showPokemonGender,
  initializeApp,
} from "./modules/common.mjs";
import { zhSpecies } from "./modules/zh-names.mjs";

const resultTemplate = document.querySelector("[data-pla-results-template]");
const resultsArea = document.querySelector("[data-pla-results]");
const mapSpawnsArea = document.querySelector("[data-pla-info-spawner]");

// options
const inputSeed = document.getElementById("inputseed");
const rollsInput = document.getElementById("rolls");
const staticAlpha = document.getElementById("staticalpha");
const genderCheckbox = document.getElementById("gendercheck");
const dayNight = document.getElementById("daynightcheck");
const mapName = document.getElementById("speciesmap");
const speciesName = document.getElementById("speciesnames");
const spawnerID = document.getElementById("spawnernames");

// filters
const genderFilter = document.getElementById("gender");

genderFilter.addEventListener("change", setFilter);
spawnerID.addEventListener("change", setSpawners);
dayNight.addEventListener("change", setSpawners);

const checkAlphaAdvButton = document.getElementById("pla-button-checkalphaadv");
checkAlphaAdvButton.addEventListener("click", checkAlphaAdv);

loadPreferences();
setupPreferenceSaving();
setupExpandables();
setupTabs();
document.getElementById("defaultOpen").click();

const results = [];

// Setup tabs
function setupTabs() {
  document.querySelectorAll(".tablinks").forEach((element) => {
    element.addEventListener("click", (event) =>
      openTab(event, element.dataset.plaTabFor)
    );
  });
}

function openTab(evt, tabName) {
  let i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// 生成点地图是整张大图，展开时图片可能还没加载完，
// 加载完再按实际高度重算一次展开容器的高度，避免被裁切。
function refreshSpawnmapHeight() {
  document
    .querySelectorAll(".pla-section-spawnmap .expandable img")
    .forEach((img) => {
      const box = img.closest(".expandable");
      if (!box) return;
      const fix = () => {
        if (box.classList.contains("expanded")) {
          box.style.maxHeight = box.scrollHeight + "px";
        }
      };
      if (!img.complete) {
        img.addEventListener("load", fix);
      }
    });
}

refreshSpawnmapHeight();

// Save and load user preferences
function loadPreferences() {
  rollsInput.value = readIntFromStorage("rolls", 1);
  genderFilter.value = readIntFromStorage("gender", 31);
  genderCheckbox.checked = readBoolFromStorage("gendercheck", false);
}

function setupPreferenceSaving() {
  rollsInput.addEventListener("change", (e) =>
    saveIntToStorage("rolls", e.target.value)
  );
  genderFilter.addEventListener("change", (e) =>
    saveIntToStorage("gender", e.target.value)
  );
  genderCheckbox.addEventListener("change", (e) =>
    saveBoolToStorage("gendercheck", e.target.checked)
  );
}

function setFilter(event) {
  showFilteredResults();
}

function setSpawners(event) {
  mapSpawnsArea.innerHTML = "";
  $.getJSON("static/resources/" + mapName.value + ".json", function (data) {
    $.each(data, function (key, value) {
      if (key == spawnerID.value) {
        console.log(key);
        var time = false;
        let cycle = dayNight.checked;
        if (cycle) time = true;
        var breakloop = false;
        $.each(value, function (timeweather, species) {
          if (
            time &&
            (timeweather.includes("Any Time") ||
              timeweather.includes("Night")) &&
            !breakloop
          ) {
            breakloop = true;
            $.each(species, function (pokemon, slot) {
              let locListItem = document.createElement("li");
              locListItem.textContent = zhSpecies(pokemon);
              mapSpawnsArea.appendChild(locListItem);
            });
          } else if (
            !time &&
            (timeweather.includes("Any Time") || timeweather.includes("Day")) &&
            !breakloop
          ) {
            console.log(timeweather);
            console.log(species);
            breakloop = true;
            $.each(species, function (pokemon, slot) {
              console.log(pokemon);
              console.log(slot);
              let locListItem = document.createElement("li");
              locListItem.textContent = zhSpecies(pokemon);
              console.log("loclistitem innertext");
              console.log(locListItem.innerText);
              mapSpawnsArea.appendChild(locListItem);
            });
          }
        });
      }
    });
  });
}

function getOptions() {
  return {
    seed: inputSeed.value,
    rolls: parseInt(rollsInput.value),
    isalpha: staticAlpha.checked,
    setgender: genderCheckbox.checked,
    filter: {
      species: speciesName.value,
      mapname: mapName.value,
      spawner: spawnerID.value,
      daynight: dayNight.checked,
    },
  };
}

function checkAlphaAdv() {
  doSearchNS("/api/check-alphaseed", results, getOptions(), showFilteredResults);
}

function showFilteredResults() {
  if (results.length > 0) {
    resultsArea.innerHTML = "";
    results.forEach((result) => showResult(result));
  } else {
    showNoResultsFound();
  }
}

function showResult(result) {
  const resultContainer = resultTemplate.content.cloneNode(true);

  resultContainer.querySelector("[data-pla-results-adv]").innerText =
    result.adv;

  showPokemonInformation(resultContainer, result);
  showPokemonIVs(resultContainer, result);

  // Overwrite Gender Display
  showPokemonGender(resultContainer, resolveGender(result));

  resultsArea.appendChild(resultContainer);
}

// 后端返回的 gender 是 1~252 的随机值（-1 表示该生成点性别固定/无性别），
// 需要和「性别比例」下拉里的雌性阈值比较才能得出性别。
function getGenderRatio() {
  const selected = genderFilter.options[genderFilter.selectedIndex];
  const raw = genderFilter.value || (selected ? selected.value : "");
  const ratio = parseInt(raw, 10);
  // 下拉未被正确选中时退回第一个选项（1♀:7♂）
  return Number.isFinite(ratio) ? ratio : 31;
}

function resolveGender(result) {
  const ratio = getGenderRatio();

  if (ratio === -1) return "genderless";
  if (ratio === 0) return "male";
  if (ratio === 254) return "female";

  const roll = Number(result.gender);
  if (!Number.isFinite(roll) || roll < 0) return "";

  return roll < ratio ? "female" : "male";
}
