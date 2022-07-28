function SaveUrls() {
  let urls = document.querySelector("#urls").value;
  browser.storage.sync.set({
    urls: urls,
  });
}

function loadData() {
  browser.storage.sync.get(
    ["urlRule", "urls", "blurOption", "hoveringOption", "childElemRatio"],
    function (result) {
      result.urls != undefined
        ? (document.querySelector("#urls").value = result.urls)
        : (document.querySelector("#urls").value = "");
      result.childElemRatio != undefined
        ? (document.querySelector("#childElemRatio").value =
            result.childElemRatio)
        : (document.querySelector("#childElemRatio").value = "");
      document.querySelector("#blurred").checked = result.blurOption;
      if (document.querySelector("#blurred").checked)
        document.querySelector("#hoveringOption").style.display = "inline-block";
      else
        document.querySelector("#hoveringOption").style.display = "none";
      document.querySelector("#hovering").checked = result.hoveringOption;
      if (result.urlRule)
        document.querySelector("#disabler").checked = result.urlRule;
      else document.querySelector("#enabler").checked = true;
    }
  );
}

function Unsaved() {
  browser.storage.sync.get("urls", function (result) {
    if (document.querySelector("#urls").value != result.urls) {
      SaveUrls();
    }
  });
}

function disablerRadio() {
  let rule = document.querySelector("#disabler").checked;
  browser.storage.sync.set({
    urlRule: rule,
  });
}

function enablerRadio() {
  let rule = document.querySelector("#disabler").checked;
  browser.storage.sync.set({
    urlRule: rule,
  });
}

function saveBlurOption() {
  let blurred = document.querySelector("#blurred").checked;
  browser.storage.sync.set({
    blurOption: blurred,
  });
  if (document.querySelector("#blurred").checked)
    document.querySelector("#hoveringOption").style.display = "block";
  else document.querySelector("#hoveringOption").style.display = "none";
}

function saveHoveringOption() {
  let hovering = document.querySelector("#hovering").checked;
  browser.storage.sync.set({
    hoveringOption: hovering,
  });
}

function setChildElemRatio() {
  let ratio = document.querySelector("#childElemRatio").value;
  browser.storage.sync.set({
    childElemRatio: ratio,
  });
}

document.addEventListener("DOMContentLoaded", function () {
  loadData();
  document.querySelector("#urls").addEventListener("change", Unsaved);
  document
    .querySelector("#blurred")
    .addEventListener("change", saveBlurOption);
  document
    .querySelector("#hovering")
    .addEventListener("change", saveHoveringOption);
  document
    .querySelector("#disabler")
    .addEventListener("change", disablerRadio);
  document.querySelector("#enabler")
  .addEventListener("change", enablerRadio);
  document.querySelector("#childElemRatio")
  .addEventListener("change", setChildElemRatio);
});
