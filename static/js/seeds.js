import {
  doSearch,
  showNoResultsFound,
  saveIntToStorage,
  readIntFromStorage,
  saveBoolToStorage,
  readBoolFromStorage,
  showPokemonIVs,
  showPokemonInformation,
  initializeApp,
  showMessage,
  MESSAGE_ERROR,
} from "./modules/common.mjs";
import { zhSpecies } from "./modules/zh-names.mjs";

const resultTemplate = document.querySelector("[data-pla-results-template]");
const resultsArea = document.querySelector("[data-pla-results]");

// options
const normalOutbreak = document.getElementById("normalcheckbox");
const inputSeed = document.getElementById("inputseed");
const frSpawns = document.getElementById("frspawns");
const brSpawns = document.getElementById("brspawns");
const bonusCheckbox = document.getElementById("bonus");
const frEncounter = document.querySelector("#frpokemon");
const brEncounter = document.querySelector("#brpokemon");

// filters
const distSelectFilter = document.getElementById("selectfilter");
const distShinyOrAlphaCheckbox = document.getElementById(
  "mmoShinyOrAlphaFilter"
);
const distShinyCheckbox = document.getElementById("mmoShinyFilter");
const distAlphaCheckbox = document.getElementById("mmoAlphaFilter");
const distDefaultCheckbox = document.getElementById("mmoDefaultRouteFilter");
const distMultiCheckbox = document.getElementById("mmoMultiFilter");

//distShinyOrAlphaCheckbox.addEventListener("change", setFilter);
distShinyCheckbox.addEventListener("change", setFilter);
distAlphaCheckbox.addEventListener("change", setFilter);
distDefaultCheckbox.addEventListener("change", setFilter);
distMultiCheckbox.addEventListener("change", setFilter);

const checkMMOsButton = document.getElementById("pla-button-checkmmos");
checkMMOsButton.addEventListener("click", checkMMOs);

initializeApp("seeds");
loadPreferences();
setupPreferenceSaving();

const results = [];

// Save and load user preferences
function loadPreferences() {
  distAlphaCheckbox.checked = readBoolFromStorage("mmoAlphaFilter", false);
  distShinyCheckbox.checked = readBoolFromStorage("mmoShinyFilter", false);
  /*distShinyOrAlphaCheckbox.checked = readBoolFromStorage(
    "mmoShinyOrAlphaFilter",
    false
  );*/
  distDefaultCheckbox.checked = readBoolFromStorage(
    "mmoDefaultRouteFilter",
    false
  );
  frSpawns.value = readIntFromStorage("frspawns", 1);
  brSpawns.value = readIntFromStorage("brspawns", 1);
  bonusCheckbox.checked = readBoolFromStorage("bonus", false);
  //validateFilters();
}

function setupPreferenceSaving() {
  distAlphaCheckbox.addEventListener("change", (e) =>
    saveBoolToStorage("mmoAlphaFilter", e.target.checked)
  );
  distShinyCheckbox.addEventListener("change", (e) =>
    saveBoolToStorage("mmoShinyFilter", e.target.checked)
  );
  /*distShinyOrAlphaCheckbox.addEventListener("change", (e) =>
    saveBoolToStorage("mmoShinyOrAlpaFilter", e.target.checked)
  );*/
  frSpawns.addEventListener("change", (e) =>
    saveIntToStorage("frspawns", e.target.value)
  );
  brSpawns.addEventListener("change", (e) =>
    saveIntToStorage("brspawns", e.target.value)
  );
  bonusCheckbox.addEventListener("change", (e) =>
    saveBoolToStorage("bonus", e.target.checked)
  );
}

function setFilter(event) {
  if (event.target.checked) {
    /*if (event.target == distShinyOrAlphaCheckbox) {
      distShinyCheckbox.checked = false;
      distAlphaCheckbox.checked = false;
    }*/
    if (event.target == distShinyCheckbox) {
      //distShinyOrAlphaCheckbox.checked = false;
    }
    if (event.target == distAlphaCheckbox) {
      //distShinyOrAlphaCheckbox.checked = false;
    }
  }

  showFilteredResults();
}

function validateFilters() {
  //let shinyOrAlphaFilter = distShinyOrAlphaCheckbox.checked;
  let shinyFilter = distShinyCheckbox.checked;
  let alphaFilter = distAlphaCheckbox.checked;

  /*if (shinyOrAlphaFilter) {
    shinyFilter = false;
    alphaFilter = false;
  }

  if (shinyFilter || alphaFilter) {
    shinyOrAlphaFilter = false;
  }

  distShinyOrAlphaCheckbox.checked = shinyOrAlphaFilter;*/
  distShinyCheckbox.checked = shinyFilter;
  distAlphaCheckbox.checked = alphaFilter;
}

function filter(
  result,
  shinyFilter,
  alphaFilter,
  defaultFilter,
  multiFilter
) {
  /*if (shinyOrAlphaFilter && !(result.shiny || result.alpha)) {
    return false;
  }*/

  if (shinyFilter && !result.shiny) {
    return false;
  }

  if (alphaFilter && !result.alpha) {
    return false;
  }

  if (defaultFilter && !result.defaultroute) {
    return false;
  }

  // 注意：result.multi 不是后端返回的字段（后端一律给 false），
  // 它只在 showResult() 渲染时被临时置 true。所以如果先勾「仅多闪路径」再搜索，
  // 结果里 multi 全是 false，会被这里全部过滤掉，界面上一条都不显示。
  // 直接看 chains：有额外闪光连锁就是多闪路径。
  if (multiFilter && (!Array.isArray(result.chains) || result.chains.length == 0)) {
    return false;
  }

  return true;
}

function getOptions() {
  return {
    seed: inputSeed.value,
    frspawns: parseInt(frSpawns.value),
    brspawns: parseInt(brSpawns.value),
    isbonus: bonusCheckbox.checked,
    frencounter: frEncounter.value,
    brencounter: brEncounter.value,
	filter: distSelectFilter.value,
	isnormal: normalOutbreak.checked,
    //	inmap: inmapCheck.checked
  };
}

function checkMMOs() {
  // 宝可梦没选就发请求，后端会拿到空的遭遇表，一路抛到 500，
  // 前端只会看到一句看不懂的 JSON 解析错误，所以这里先拦住。
  if (!frEncounter.value) {
    showMessage(MESSAGE_ERROR, "请先选择第一轮宝可梦。");
    frEncounter.focus();
    return;
  }
  if (bonusCheckbox.checked && !brEncounter.value) {
    showMessage(
      MESSAGE_ERROR,
      "已勾选「是否奖励轮」，请先选择奖励轮宝可梦，或取消勾选奖励轮。"
    );
    brEncounter.focus();
    return;
  }

  doSearch(
    "/api/check-mmoseed",
    results,
    getOptions(),
    showFilteredResults,
    checkMMOsButton
  );
}

function showFilteredResults() {
  //validateFilters();

  //let shinyOrAlphaFilter = distShinyOrAlphaCheckbox.checked;
  let shinyFilter = distShinyCheckbox.checked;
  let alphaFilter = distAlphaCheckbox.checked;
  let defaultFilter = distDefaultCheckbox.checked;
  let multiFilter = distMultiCheckbox.checked;

  const filteredResults = results.filter((result) =>
    filter(
      result,
      shinyFilter,
      alphaFilter,
      defaultFilter,
      multiFilter
    )
  );

  if (filteredResults.length > 0) {
    resultsArea.innerHTML =
      "<h3><section class='pla-section-results' flow>D = 消失。可以通过群战（性格强势的宝可梦）或惊吓（性格胆小的宝可梦）让多只宝可梦同时消失。</section></h3>";
    filteredResults.forEach((result) => showResult(result));
  } else {
    showNoResultsFound();
  }
}

function showResult(result) {
  const resultContainer = resultTemplate.content.cloneNode(true);

  let indexprefix = "";
  let chainprefix = "";
  if (result.chains.length == 0) {
    indexprefix = "单闪路径：<br>" + result.index;
    chainprefix = "该路径上没有其他闪光";
  } else {
    indexprefix =
      "多闪路径（完成可得到不止一只闪光）：<br>" +
      result.index;
    chainprefix = "<br>" + result.chains;
    result.multi = true;
  }
  resultContainer.querySelector("[data-pla-results-location]").innerHTML =
    indexprefix;
  resultContainer.querySelector("[data-pla-info-chains]").innerHTML =
    chainprefix;

  showPokemonInformation(resultContainer, result);
  showPokemonIVs(resultContainer, result);

  resultsArea.appendChild(resultContainer);
}
