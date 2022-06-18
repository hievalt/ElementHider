// Tags that will be checked for keywords
let elemTags =
  "em, h1, h2, h3, h4, h5, h6, span, b, a, p, li, article, strong, blockquote, div, th, td, img";

// Elements (to hide) can contain 0,6% of all page elements if its >=25 (else = 25)

/**
 * testElem
 * Testmode, highlights elements with green border
 * @param  Element elem - element to be handled
 
 */
function testElem(elem, word) {
  Object.assign(elem.style, {
    border: "solid",
    "border-color": "lime",
    "border-width": "2px",
  });
  if (
    elem.getAttribute("title") === undefined ||
    elem.getAttribute("title") === null
  )
    elem.setAttribute("title", "Keywords found: " + word);
  else if (!elem.getAttribute("title").includes("Keywords found:"))
    elem.setAttribute("title", "Keyword found: " + word);
  else elem.setAttribute("title", elem.getAttribute("title") + ", " + word);
}

/**
 * hideElem, hides or blurs element (depends on settings)
 * @param Element elem - Element to be handled
 * @param String word - Word that contains one of the keywords
 */
function hideElem(elem, word) {
  chrome.storage.sync.get("blurOption", function (result) {
    if (result.blurOption) {
      Object.assign(elem.style, {
        filter: "blur(10px)",
      });
      let timeOut;
      chrome.storage.sync.get("hoveringOption", function (result) {
        if (result.hoveringOption) {
          // If "Reveal on hover" -setting is checked, remove blur on mouse hover
          elem.addEventListener("mouseover", () => {
            timeOut = setTimeout(() => {
              Object.assign(elem.style, {
                filter: "blur(0px)",
              });
            }, 500);
          });
          elem.addEventListener("mouseleave", () => {
            // Blur element again on mouseleave
            clearTimeout(timeOut);
            Object.assign(elem.style, {
              filter: "blur(10px)",
            });
          });
        } else {
          // If "hover to reveal" -option is unchecked, show which keywords were found on the element onhover
          if (
            elem.getAttribute("title") === undefined ||
            elem.getAttribute("title") === null
          )
            elem.setAttribute("title", "Keywords found: " + word);
          else if (!elem.getAttribute("title").includes("Keywords found:"))
            elem.setAttribute("title", "Keyword found: " + word);
          else
            elem.setAttribute(
              "title",
              elem.getAttribute("title") + ", " + word
            );
        }
      });
    } else {
      elem.style.display = "none";
    }
  });
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
}

/**
 * checkAllElems, go through elements and check if they contain any of the keywords
 * @param  Array wordlist - array of keywords
 * @param  bool testingMode - testing mode on/off
 * @param  Element elem - Element or string of tags
 */
function checkAllElems(wordlist, testingMode, elem) {
  let elemType;
  if (elem != elemTags) {
    elemType = elem.parentElement.parentElement.querySelectorAll(elemTags);
  } else elemType = document.querySelectorAll(elem);

  elemType.forEach((tag) => {
    chrome.storage.sync.get("childElemRatio", function (result) {
      let percentage = !isNaN(parseFloat(result.childElemRatio))
        ? parseFloat(result.childElemRatio.replace(",", ".")) / 100
        : 0.02;
      childElemRatio = parseInt($("body").find("*").length * percentage);
      if (tag.querySelectorAll("*").length < childElemRatio) {
        // How many child elements are allowed
        let elemExist = setInterval(function () {
          if (tag != null) clearInterval(elemExist);
        }, 100);
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
              if (word.slice(0, 1) === "{" && word.slice(-1) === "}")
                hideViaSelector(
                  document.querySelector(
                    word.replace("{", "").replace("}", "")
                  ),
                  testingMode
                );

              // If word has to be exactly in the given format but special characters can follow
              if (word.slice(0, 1) === "*") {
                // Remove * from the keyword
                word = word.slice(1).trim();

                // If keyword has to be exact but is case-insensitive
                if (word.slice(-1) === "^") {
                  word = word.slice(0, -1);
                  if (
                    new RegExp("\\b" + word + "\\b", "gi").test(
                      tag.innerText
                    ) &&
                    tag.style.display != "none"
                  ) {
                    if (!testingMode) hideElem(tag, word);
                    else testElem(tag, word);
                  }
                  // If keyword has to be exact and case-sensitive
                } else {
                  if (
                    new RegExp("\\b" + word + "\\b", "g").test(tag.innerText) &&
                    tag.style.display != "none"
                  ) {
                    if (!testingMode) hideElem(tag, word);
                    else testElem(tag, word);
                  }
                }
                // If word is case-insensitive
              } else if (word.slice(-1) === "^") {
                word = word.slice(0, -1).trim();
                if (
                  new RegExp(word, "gi").test(tag.innerText) &&
                  tag.style.display != "none"
                ) {
                  if (!testingMode) hideElem(tag, word);
                  else testElem(tag, word);
                }
                // Word is case-sensitive and it can appear anywhere in the text.
              } else {
                word = word.trim();
                if (
                  new RegExp(word, "g").test(tag.innerText) &&
                  tag.style.display != "none"
                ) {
                  if (!testingMode) hideElem(tag, word);
                  else testElem(tag, word);
                }
              }
            }
          }
        }
      }
    });
  });
}

/**
 * getWordlist, load list of user set keywords
 * @param  Element elem - element to be handled
 */
function getWordlist(elem) {
  let wordlist;
  chrome.storage.sync.get(["words", "testingMode"], function (result) {
    wordlist = result.words.split("\n");
    checkAllElems(wordlist, result.testingMode, elem);
  });
}

/**
 * runningStatus, Check if ElementHider is enabled
 * @param  Element elem - element to be handled
 */
function runningStatus(elem) {
  chrome.storage.sync.get("enabled", function (result) {
    if (result.enabled) {
      chrome.storage.sync.get(["urlRule", "urls"], function (options) {
        if (options.urls != undefined && options.urls != "") {
          let urls = options.urls;
          urls = urls.split("\n");
          for (url in urls) {
            if (
              window.location.href.includes(urls[url].trim()) &&
              options.urlRule // urlRule set to disable on this site
            ) {
              break;
            } else if (
              window.location.href.includes(urls[url].trim()) &&
              !options.urlRule // urlRule set to enable on this site
            ) {
              getWordlist(elem);
              break;
            }
          }
        } else getWordlist(elem);
      });
    }
  });
}

/**
 *  Observer function
 *  Mutation observer to observe new or changed elements (mainly for ajax created content, better performance)
 *  Only checks new or changed elements on the webpage
 */
function Observer() {
  let observer = new MutationObserver(function (mutation) {
    for (let a = 0; a < mutation.length; a++) {
      let addedNode = mutation[a].addedNodes;
      for (let b = 0; b < addedNode.length; b++) {
        if (addedNode[b].nodeType != 1) continue;
        let node = addedNode[b];
        if (node.children.length) {
          let nodes = node.getElementsByTagName("div");
          for (let c = 0; c < nodes.length; c++) {
            runningStatus(nodes[c]);
          }
        }
      }
    }
  });

  // Mutation observer conf
  let config = {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  };

  // Start observing
  observer.observe(window.document, config);
}

// Eventhandler for document loaded
$(window).ready(function () {
  runningStatus(elemTags);
  Observer();
});

// Check all elements if url has been changed
// For websites that load new entire pages with ajax (like youtube.com)
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting === "urlChange") {
    setTimeout(function () {
      runningStatus(elemTags);
    }, 500);
  }
  sendResponse("Message received");
});
