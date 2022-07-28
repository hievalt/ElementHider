function SaveWords() {
  let currentWords = $("#keywords").val();
  browser.storage.sync
    .set({
      words: currentWords,
    })
    .then(
      () => {
        $("#maxCharError").text("");
      },
      (e) => {
        browser.storage.sync.get().then((savedWords) => {
          browser.storage.sync.getBytesInUse(Object.keys(savedWords).filter(val => val != "words")).then(() => {
            let max_sync_bytes = browser.storage.sync.QUOTA_BYTES_PER_ITEM,
              wordSize = new Blob([savedWords.words]).size,
              availableBytes = max_sync_bytes - (max_sync_bytes - wordSize);
            $("#maxCharError").text(
              "Maximum character amount exceeded! Keywords cannot be saved while character limit is not met. (" +
                new Blob([currentWords]).size +
                " / " +
                availableBytes +
                ")"
            );
          });
        });
      }
    );
}

function loadData() {
  browser.storage.sync.get(
    ["enabled", "testingMode", "words"],
    function (result) {
      if (result.words != "        " || undefined)
        $("#keywords").val(result.words);
      else $("#keywords").value = "";
      $("#toggle").prop("checked", result.enabled);
      $("#toggleTesting").prop("checked", result.testingMode);
      onOff();
    }
  );
}

function onOff() {
  if ($("#toggle").prop("checked")) {
    $("#onoff")
      .css({
        color: "black",
      })
      .text("On");
    browser.action.setBadgeText({
      text: "ON",
    });
    browser.action.setBadgeBackgroundColor({
      color: "lime",
    });
  } else {
    $("#onoff")
      .css({
        color: "red",
      })
      .text("Off");
    browser.action.setBadgeText({
      text: "OFF",
    });
    browser.action.setBadgeBackgroundColor({
      color: "red",
    });
  }
}

function saveEnabled() {
  let enabled = $("#toggle").prop("checked");
  browser.storage.sync.set({
    enabled: enabled,
  });
  onOff();
}

function saveTestingMode() {
  let testingMode = $("#toggleTesting").prop("checked");
  browser.storage.sync.set({
    testingMode: testingMode,
  });
}

function Unsaved() {
  browser.storage.sync.get("words", function (result) {
    if ($("#keywords").val() != result.words) {
      SaveWords();
    }
  });
}

function showExamples() {
  if (document.getElementById("help").innerHTML === "Show keyword examples") {
    $("#examples").slideDown(500);
    document.getElementById("help").innerHTML = "Hide keyword examples";
    $("body").animate(
      {
        scrollTop: $(document).height() - $(window).height(),
      },
      1400,
      "swing"
    );
  } else {
    $("#examples").slideUp(500);
    document.getElementById("help").innerHTML = "Show keyword examples";
  }
}

function keywordEditor() {
  browser.windows.create({
    url: browser.runtime.getURL("src/browser_action/KeywordEditor.html"),
    type: "popup",
    width: 600,
    height: 400,
    focused: true,
  });
}

function showOptions() {
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else window.open(browser.runtime.getURL("options.html"));
}

$(document).ready(function () {
  loadData();
  $("#keywords").bind("input", Unsaved);
  $("#openKeywords").bind("click", keywordEditor);
  $("#save-btn").bind("click", SaveWords);
  $("#toggle").bind("change", saveEnabled);
  $("#toggleTesting").bind("change", saveTestingMode);
  $("#help").bind("click", showExamples);
  $("#optionsIcon").bind("click", showOptions);
  // Animations
  $("#logo").slideDown(250);
  $("#logoLine").fadeIn(1500);
  $("#wordLine").fadeIn(500);
  $("#keywords").fadeIn(500);
  $("#onoff").fadeIn(500);
  $("#testingMode").fadeIn(500);
  $("#help").fadeIn(500);
});
