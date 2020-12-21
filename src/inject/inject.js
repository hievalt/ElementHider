/**
 * TODO:
 * Badge (on/off)
 */


// Tags that will be checked for keywords 
var elemTags = 'em, h1, h2, h3, h4, h5, h6, span, b, a, p, li, article, strong, blockquote, div, th, td, img';

// Max children elements allowed (default presets)
var cDefault = parseInt($('body').find('*').length * 0.006), // Elements (to hide) can contain 0,6% of all page elements if its >=25 (else = 25)
    cTwitter = 200,
    cYoutube = 75,
    cFacebook = 300,
    cReddit = 75,
    cVimeo = 100,
    cAmazon = 100,
    cTumblr = 100;

if (cDefault < 25) cDefault = 25;



/**
 * testElem
 * Testmode, highlights elements with green border
 * @param  Element elem - element to be handled
 
 */
function testElem(elem, word) {
    elem.css({
        'border': 'solid',
        'border-color': 'lime',
        'border-width': '2px'
    });
    if (elem.attr('title') == undefined) elem.attr('title', 'Keywords found: ' + word);
    else if (!elem.attr('title').includes('Keywords found:')) elem.attr('title', 'Keyword found: ' + word);
    else elem.attr('title', elem.attr('title') + ', ' + word);

}

/**
 * hideElem, hides or blurs element (depends on settings)
 * @param Element elem - Element to be handled
 * @param String word - Word that contains one of the keywords
 */
function hideElem(elem, word) {
    chrome.storage.sync.get('blurOption', function(result) {
        if (result.blurOption) {
            elem.css({
                'filter': 'blur(10px)'
            });
            var timeOut;
            chrome.storage.sync.get('hoveringOption', function(result) {
                if (result.hoveringOption) {
                    // If "Reveal on hover" -setting is checked, remove blur on mouse hover
                    elem.hover(function() {
                        timeOut = setTimeout(function() {
                            elem.css({
                                'filter': 'blur(0px)'
                            });
                        }, 500)
                    }, function() {
                        // Blur element again on mouseleave
                        clearTimeout(timeOut);
                        elem.css({
                            'filter': 'blur(10px)'
                        });
                    });
                } else {
                    // If "hover to reveal" -option is unchecked, show which keywords were found on the element onhover
                    if (elem.attr('title') == undefined) elem.attr('title', 'Keywords found: ' + word);
                    else if (!elem.attr('title').includes('Keywords found:')) elem.attr('title', 'Keyword found: ' + word);
                    else elem.attr('title', elem.attr('title') + ', ' + word);
                }
            });
        } else {
            chrome.storage.sync.get('disableAnim', function(result){
                if (result.disableAnim) {
                    elem.hide();
                } else elem.slideUp("slow");
            });
            
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
        if ($(selector).css('display') != 'none') {
            $(selector).css({
                'display': 'none'
            });
        }
    } else $(selector).css({
        'border': 'solid',
        'border-color': 'blue',
        'border-width': '2px'
    });
}

/**
 * checkAllElems, go through elements and check if they contain any of the keywords
 * @param  Array wordlist - array of keywords
 * @param  bool testingMode - testing mode on/off
 * @param  Element elem - Element or string of tags
 */
function checkAllElems(wordlist, testingMode, elem) {
    var maxChildren = cDefault;
    // Check if user is on website that has a preset set
    if (window.location.href.includes('www.youtube.com')) maxChildren = cYoutube;
    else if (window.location.href.includes('https://twitter.com')) maxChildren = cTwitter;
    else if (window.location.href.includes('www.facebook.com')) maxChildren = cFacebook;
    else if (window.location.href.includes('www.reddit.com')) maxChildren = cReddit;
    else if (window.location.href.includes('www.vimeo.com')) maxChildren = cVimeo;
    else if (window.location.href.includes('www.amazon.com')) maxChildren = cAmazon;
    else if (window.location.href.includes('www.tumblr.com')) maxChildren = cTumblr;

    // console.log('Max children: ' + maxChildren);

    var elemType;
    if (elem != elemTags) {
        elemType = $(elem).parent().parent(elemTags);
    } else elemType = $(elem);

    elemType.each(function(i) {
        if ($(this).find('*').length < maxChildren) { // How many child elements are allowed
            var elemExist = setInterval(function() {
                if ($(this) != null) clearInterval(elemExist);
            }, 100);
            for (i in wordlist) {
                /* Keyword cannot be empty. 
                '//' starts a comment line and can be ignored. */
                if (wordlist[i] != '' && wordlist[i].slice(0, 2) != '//') {

                    var word = wordlist[i].toString(); //toString bc if word contains only numbers

                    // Keyword is {css selector}
                    if (word.slice(0, 1) == '{' && word.slice(-1) == '}') hideViaSelector($(word.replace('{', '').replace('}', '')), testingMode)

                    // If word has to be exactly in the given format but special characters can follow
                    if (word.slice(0, 1) == '*') {

                        // Remove * from the keyword 
                        word = word.slice(1).trim();

                        // If keyword has to be exact but is case-insensitive
                        if (word.slice(-1) == '^') {
                            word = word.slice(0, -1);
                            if (new RegExp("\\b" + word + "\\b", 'gi').test($(this).text()) && $(this).css('display') != 'none') {
                                if (!testingMode) hideElem($(this), word);
                                else testElem($(this), word);
                            }
                            // If keyword has to be exact and case-sensitive 
                        } else {
                            if (new RegExp("\\b" + word + "\\b", 'g')
                                .test($(this).text()) && $(this).css('display') != 'none') {
                                if (!testingMode) hideElem($(this), word);
                                else testElem($(this), word);
                            }
                        }
                        // If word is case-insensitive
                    } else if (word.slice(-1) == '^') {
                        word = word.slice(0, -1).trim();
                        if (new RegExp(word, 'gi')
                            .test($(this).text()) && $(this).css('display') != 'none') {
                            if (!testingMode) hideElem($(this), word);
                            else testElem($(this), word);
                        }
                        // Word is case-sensitive and it can appear anywhere in the text.
                    } else {
                        word = word.trim();
                        if (new RegExp(word, 'g')
                            .test($(this).text()) && $(this).css('display') != 'none') {
                            if (!testingMode) hideElem($(this), word);
                            else testElem($(this), word);
                        }
                    }
                }
            }
        }
    });
}

/**
 * getWordlist, load list of user set keywords
 * @param  Element elem - element to be handled
 */
function getWordlist(elem) {
    var wordlist;
    chrome.storage.sync.get(['words', 'testingMode'], function(result) {
        wordlist = result.words.split('\n');
        checkAllElems(wordlist, result.testingMode, elem);
    });
}

/**
 * runningStatus, Check if ElementHider is enabled
 * @param  Element elem - element to be handled
 */
function runningStatus(elem) {
    chrome.storage.sync.get('enabled', function(result) {
        if (result.enabled) {
            var found = false;
            chrome.storage.sync.get(['urlRule', 'urls'], function(options) {
                if (options.urls != undefined) {
                    var urls = options.urls;
                    urls = urls.split('\n');
                    if (options.urlRule) {
                        for (url in urls) {
                            if (urls[url].trim() !== '') {
                                if (window.location.href.includes(urls[url].trim())) found = true;
                                // console.log(urls[url].trim());
                            }
                            if (found) break;
                        }
                        if (!found) {
                            getWordlist(elem);

                        } // else console.log('Disabled url detected: ' + urls[url]);
                    } else {
                        for (url in urls) {
                            if (urls[url].trim() !== '') {
                                if (window.location.href.includes(urls[url].trim())) found = true;
                                // console.log(urls[url].trim());
                            }
                            if (found) break;
                        }
                        if (found) {
                            getWordlist(elem);
                            // console.log('Enabled url detected: ' + urls[url]);
                        } // else  console.log('[2] Url blocked');
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
    var observer = new MutationObserver(function(mutation) {
        for (var a = 0; a < mutation.length; a++) {
            var addedNode = mutation[a].addedNodes;
            for (var b = 0; b < addedNode.length; b++) {
                if (addedNode[b].nodeType != 1) continue;
                var node = addedNode[b];
                if (node.children.length) {
                    var nodes = node.getElementsByTagName('div');
                    for (var c = 0; c < nodes.length; c++) {
                        runningStatus(nodes[c]);
                    }
                }
            }
        }
    });

    // Mutation observer conf
    var config = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    };

    // Start observing
    observer.observe(window.document, config);
}

// Eventhandler for document loaded
$(window).ready(function() {
    runningStatus(elemTags);
    Observer();
});

// Check all elements if url has been changed
// For websites that load new entire pages with ajax (like youtube.com)
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == 'urlChange') {
        setTimeout(function() {
            runningStatus(elemTags);
            // console.log('runningStatus was called.');
        }, 500);
    }
    sendResponse('Message received');
});