// Tags that will be checked for keywords
const ELEM_TAGS =
  "em, h1, h2, h3, h4, h5, h6, span, b, a, p, li, article, strong, blockquote, div, th, td, img";

const config = {
  percentage: 0,
  blurOption: 0,
  hoveringOption: 0,
  words: 0,
  performanceMode: 0,
  testingMode: 0,
  urlRule: 0,
  urls: 0,
  observer: 0,
  childElemRatioMin: 0,
  childElemRatio: 0,
  enabled: 0
};

const initConfig = () => {
  chrome.storage.sync.get(
    [
      "childElemRatio",
      "childElemRatioMin",
      "blurOption",
      "hoveringOption",
      "performanceMode",
      "testingMode",
      "words",
      "urlRule",
      "urls",
      "enabled"

    ],
    (result) => {
      config.percentage = !isNaN(parseFloat(result.childElemRatio))
        ? parseFloat(result.childElemRatio.replace(",", ".")) / 100
        : 0.016;
      config.childElemRatioMin = !isNaN(parseInt(result.childElemRatioMin))
        ? parseInt(result.childElemRatioMin)
        : 35;
      config.childElemRatio = parseInt(
        document.querySelectorAll("*").length * config.percentage
      );
      config.blurOption = result.blurOption;
      config.hoveringOption = result.hoveringOption;
      config.performanceMode = result.performanceMode;
      config.testingMode = result.testingMode;
      config.words = result.words;
      config.urlRule = result.urlRule;
      config.urls = result.urls;
      config.observer = Observer();

      runningStatus(ELEM_TAGS);
    }
  );
};

/**
   * testElem
   * Testmode, highlights elements with green border
   * @param  Element elem - element to be handled
   
   */
function testElem(elem, word) {
  elem.css({
    border: "solid",
    "border-color": "lime",
    "border-width": "2px",
  });
  if (elem.attr("title") == undefined)
    elem.attr("title", "Keywords found: " + word);
  else if (!elem.attr("title").includes("Keywords found:"))
    elem.attr("title", "Keywords found: " + word);
  else elem.attr("title", elem.attr("title") + ", " + word);

  elem.addClass("ehext-found");
}

/**
 * hideElem, hides or blurs element (depends on settings)
 * @param Element elem - Element to be handled
 * @param String word - Word that contains one of the keywords
 */
function hideElem(elem, word) {
  if (config.blurOption) {
    elem.css({
      filter: "blur(10px)",
    });
    let timeOut;
    if (config.hoveringOption) {
      // If "Reveal on hover" -setting is checked, remove blur on mouse hover
      elem.hover(
        function () {
          timeOut = setTimeout(function () {
            elem.css({
              filter: "blur(0px)",
            });
          }, 500);
        },
        function () {
          // Blur element again on mouseleave
          clearTimeout(timeOut);
          elem.css({
            filter: "blur(10px)",
          });
        }
      );
    } else {
      // If "hover to reveal" -option is unchecked, show which keywords were found on the element onhover
      if (elem.attr("title") == undefined)
        elem.attr("title", "Keywords found: " + word);
      else if (!elem.attr("title").includes("Keywords found:"))
        elem.attr("title", "Keywords found: " + word);
      else elem.attr("title", elem.attr("title") + ", " + word);
    }
  } else {
    elem.hide();
  }
  elem.addClass("ehext-found");
}

/**
 * hideViaSelector, Hides elements via css-selector
 * If testing mode is on, highlights elements with blue instead of hiding
 * @param  String selector - css-selector to hide
 * @param  bool testingMode - testingMode on/off
 */
function hideViaSelector(selector, testingMode) {
  if (!testingMode) {
    if ($(selector).css("display") != "none") {
      $(selector).css({
        display: "none",
      });
    }
  } else
    $(selector).css({
      border: "solid",
      "border-color": "blue",
      "border-width": "2px",
    });

  selector.addClass("ehext-found");
}

/**
 * checkAllElems, go through elements and check if they contain any of the keywords
 * @param  Array wordlist - array of keywords
 * @param  bool testingMode - testing mode on/off
 * @param  Element elem - Element or string of tags
 */
function checkAllElems(wordlist, testingMode, elem) {
  let checkElem,
    elemType,
    found = false;
  if (elem != ELEM_TAGS) {
    elemType = $(elem).parent(ELEM_TAGS);
  } else elemType = $(elem);

  config.childElemRatio =
    config.childElemRatio >= config.childElemRatioMin
      ? config.childElemRatio
      : config.childElemRatioMin;

  elemType.each(function () {
    if (
      $(this).find("*").length < config.childElemRatio ||
      $(this).hasClass("ehext-found")
    ) {
      $(this).parent(ELEM_TAGS).find("*").length < config.childElemRatio
        ? (checkElem = $(this).parent(ELEM_TAGS))
        : (checkElem = $(this));

      if (checkElem.hasClass("ehext-found")) {
        checkElem.removeAttr("title");
        checkElem.removeAttr("style");
        checkElem.unbind("mouseenter");
        checkElem.unbind("mouseleave");
        checkElem.show();
      }

      for (word in wordlist) {
        /* Keyword cannot be empty. 
                '//' starts a comment line and can be ignored. */
        if (wordlist[word] != "" && wordlist[word].slice(0, 2) != "//") {
          word = wordlist[word].toString().split(">>>"); //toString bc if word contains only numbers
          let url = word.length > 1 ? word[1] : null;
          word = word[0].trim();

          if (
            (url != null && window.location.href.includes(url.trim())) ||
            url === null
          ) {
            // Keyword is {css selector}
            if (word.slice(0, 1) == "{" && word.slice(-1) == "}") {
              hideViaSelector(
                $(word.replace("{", "").replace("}", "")),
                testingMode
              );
              continue;
            }

            // If word has to be exactly in the given format but special characters can follow
            if (word.slice(0, 1) == "*") {
              // Remove * from the keyword
              word = word.slice(1).trim();

              // If keyword has to be exact but is case-insensitive
              if (word.slice(-1) == "^") {
                word = word.slice(0, -1);
                if (
                  new RegExp("\\b" + word + "\\b", "gi").test(
                    checkElem.text()
                  ) &&
                  checkElem.css("display") != "none"
                ) {
                  found = true;
                  if (!testingMode) hideElem(checkElem, word);
                  else testElem(checkElem, word);
                }
                // If keyword has to be exact and case-sensitive
              } else {
                if (
                  new RegExp("\\b" + word + "\\b", "g").test(
                    checkElem.text()
                  ) &&
                  checkElem.css("display") != "none"
                ) {
                  found = true;
                  if (!testingMode) hideElem(checkElem, word);
                  else testElem(checkElem, word);
                }
              }
              // If word is case-insensitive
            } else if (word.slice(-1) == "^") {
              word = word.slice(0, -1).trim();
              if (
                new RegExp(word, "gi").test(checkElem.text()) &&
                checkElem.css("display") != "none"
              ) {
                found = true;
                if (!testingMode) hideElem(checkElem, word);
                else testElem(checkElem, word);
              }
              // Word is case-sensitive and it can appear anywhere in the text.
            } else {
              word = word.trim();
              if (
                new RegExp(word, "g").test(checkElem.text()) &&
                checkElem.css("display") != "none"
              ) {
                found = true;
                if (!testingMode) hideElem(checkElem, word);
                else testElem(checkElem, word);
              }
            }
          }
        }
      }
    }
  });
}

const checkAlreadyFound = () => {
  let currLength = 0,
    docLength = 0,
    inter = setInterval(() => {
      currLength = $(document).find("*").length;
      if (currLength > docLength) {
        docLength = currLength;
      } else {
        runningStatus(ELEM_TAGS);
        clearInterval(inter);
      }
    }, 1);
};

/**
 * getWordlist, load list of user set keywords
 * @param  Element elem - element to be handled
 */
function getWordlist(elem) {
  let wordlist;
  wordlist = config.words.split("\n");
  checkAllElems(wordlist, config.testingMode, elem);
}

/**
 * runningStatus, Check if ElementHider is enabled
 * @param  Element elem - element to be handled
 */
function runningStatus(elem) {
  if (config.urls != undefined && config.urls != "" && config.enabled) {
    let urls = config.urls;
    urls = urls.split("\n");
    for (url in urls) {
      if (
        window.location.href.includes(urls[url].trim()) &&
        config.urlRule // urlRule set to disable on this site
      ) {
        break;
      } else if (
        window.location.href.includes(urls[url].trim()) &&
        !config.urlRule // urlRule set to enable on this site
      ) {
        getWordlist(elem);
        break;
      } else if (config.urlRule) {
        getWordlist(elem);
      }
    }
  } else {
    getWordlist(elem);
  }
}

/**
 *  Observer function
 *  Mutation observer to observe new or changed elements (mainly for ajax created content, better performance)
 *  Only checks new or changed elements on the webpage
 */
function Observer() {
  let currentUrl = location.href;

  let observer = new MutationObserver(function (mutation) {
    if (currentUrl === location.href)
      config.childElemRatio += parseInt(
        (mutation.length * config.percentage) / 2
      );
    else {
      config.childElemRatio = parseInt(
        document.querySelectorAll("*").length * config.percentage
      );
      currentUrl = location.href;
    }
    for (let a = 0; a < mutation.length; a++) {
      let addedNode = mutation[a].addedNodes;
      for (let b = 0; b < addedNode.length; b++) {
        if (addedNode[b].nodeType != 1) continue;
        let node = addedNode[b];
        if (node.children.length) {
          let nodes = node.getElementsByTagName("*");
          for (let c = 0; c < nodes.length; c++) {
            runningStatus(nodes[c]);
          }
        }
      }
    }
  });

  // Mutation observer conf
  let obsConfig = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  };

  // Start observing
  observer.observe(window.document, obsConfig);
  return observer;
}

// Check all elements if url has been changed
// For websites that load new entire pages with ajax (like youtube.com)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting === "urlChange") {
    let urlChangeHandled = false;
    $(ELEM_TAGS).on("load", (e) => {
      if (!urlChangeHandled) {
        checkAlreadyFound();
        urlChangeHandled = true;
      }
    });
  }
  sendResponse("Message received");
});

chrome.storage.sync.get(["enabled", "performanceMode"], (result) => {
  if (result.enabled) {
    result.performanceMode
      ? initConfig()
      : $(document).ready(() => {
          initConfig();
        });
  }
});
