/**
 * TODO:
 * Badge (on/off)
 */


// Tags that will be checked for keywords 
var elemTags = 'em, h1, h2, h3, h4, h5, h6, span, b, a, p, li, article, strong, blockquote, div, th, td';
// Max children elements allowed (default presets)
var cDefault = parseInt($('body').find('*').length * 0.006), // Elements (to hide) can contain 0,3% of all page elements if its >=25 (else = 25)
    cTwitter = 200,
    cYoutube = 75,
    cFacebook = 300,
    cReddit = 75,
    cVimeo = 100,
    cAmazon = 100,
    cTumblr = 100;

if (cDefault < 25) cDefault = 25;



/**
 * [testElem Testing mode, highlights elements instead of hiding]
 * @param  {[element]} elem   [element to be handled]
 
 */
function testElem(elem, sana) {
    elem.css({
        'border': 'solid',
        'border-color': 'lime',
        'border-width': '2px'
    });
    if (elem.attr('title') == undefined) elem.attr('title', 'Keywords found: ' + sana);
    else if (!elem.attr('title').includes('Keywords found:')) elem.attr('title', 'Keyword found: ' + sana);
    else elem.attr('title', elem.attr('title') + ', ' + sana);

}

/**
 * [hideElem Hide Element]
 * @param  {element} elem   element to be handled
 * @param {string} sana     word found
 */
function hideElem(elem, sana) {
    chrome.storage.sync.get('blurOption', function(result) {
        if (result.blurOption) {
            elem.css({ 'filter': 'blur(10px)' });
            var timeOut;
            chrome.storage.sync.get('hoveringOption', function(result) {
                if (result.hoveringOption) {
                    elem.hover(function() {
                        timeOut = setTimeout(function() { elem.css({ 'filter': 'blur(0px)' }); }, 500)
                    }, function() {
                        clearTimeout(timeOut);
                        elem.css({ 'filter': 'blur(10px)' });
                    });
                } else {
                    if (elem.attr('title') == undefined) elem.attr('title', 'Keywords found: ' + sana);
                    else if (!elem.attr('title').includes('Keywords found:')) elem.attr('title', 'Keyword found: ' + sana);
                    else elem.attr('title', elem.attr('title') + ', ' + sana);
                }
            });
        } else elem.slideUp("slow");
    });



}


/**
 * [hideViaSelector Hide elements with selector]
 * @param  {[string]} selector    [css selector]
 * @param  {[bool]} testingMode [Is testing mode enabled]
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
 * [checkAllElems go through elements and check if they contain any of the keywords]
 * @param  {[array]} sanalista  [array of keywords]
 * @param  {[bool]} testingMode [is testing mode enabled]
 * @param  {[element]} elem     [element or string of tags]
 */
function checkAllElems(sanalista, testingMode, elem) {
    var maxChildren = cDefault;
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
            for (i in sanalista) {
                /* Keyword cannot be empty. 
                '//' starts a comment line and can be ignored. */
                if (sanalista[i] != '' && sanalista[i].slice(0, 2) != '//') {

                    var sana = sanalista[i].toString(); //toString bc if sana contains only numbers

                    /* Keyword is {css selector} */
                    if (sana.slice(0, 1) == '{' && sana.slice(-1) == '}') hideViaSelector($(sana.replace('{', '').replace('}', '')), testingMode)

                    /* If word has to be exactly in the given format but special characters can follow */
                    if (sana.slice(0, 1) == '*') {

                        /* Remove * from the keyword */
                        sana = sana.slice(1).trim();

                        /* If keyword has to be exact but is case-insensitive */
                        if (sana.slice(-1) == '^') {
                            sana = sana.slice(0, -1);
                            if (new RegExp("\\b" + sana + "\\b", 'gi').test($(this).text()) && $(this).css('display') != 'none') {
                                if (!testingMode) hideElem($(this), sana);
                                else testElem($(this), sana);
                            }
                            /* If keyword has to be exact and case-sensitive */
                        } else {
                            if (new RegExp("\\b" + sana + "\\b", 'g')
                                .test($(this).text()) && $(this).css('display') != 'none') {
                                if (!testingMode) hideElem($(this), sana);
                                else testElem($(this), sana);
                            }
                        }
                        /* If word is case-insensitive */
                    } else if (sana.slice(-1) == '^') {
                        sana = sana.slice(0, -1).trim();
                        if (new RegExp(sana, 'gi')
                            .test($(this).text()) && $(this).css('display') != 'none') {
                            if (!testingMode) hideElem($(this), sana);
                            else testElem($(this), sana);
                        }
                        /* Word is case-sensitive and it can appear anywhere in the text. */
                    } else {
                        sana = sana.trim();
                        if (new RegExp(sana, 'g')
                            .test($(this).text()) && $(this).css('display') != 'none') {
                            if (!testingMode) hideElem($(this), sana);
                            else testElem($(this), sana);
                        }
                    }
                }
            }
        }
    });
}

/**
 * [getSanalista load list of user set words]
 * @param  {[element]} elem [element to be handled]
 */
function getSanalista(elem) {
    var sanalista;
    chrome.storage.sync.get(['words', 'testingMode'], function(result) {
        sanalista = result.words.split('\n');
        checkAllElems(sanalista, result.testingMode, elem);
    });
}

/**
 * [runningStatus Check if ElementHider is enabled]
 * @param  {[element]} elem [element to be handled]]
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
                            getSanalista(elem);

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
                            getSanalista(elem);
                            // console.log('Enabled url detected: ' + urls[url]);
                        } // else  console.log('[2] Url blocked');
                    }
                } else getSanalista(elem);
            });
        }
    });
}

// Monitor new or changed DOM
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
                        // console.log(nodes[c].className);
                        runningStatus(nodes[c]);
                        /* $(nodes[c]).css({
                            'border': 'solid',
                            'border-color': 'lime',
                            'border-width': '2px'
                        }); */
                    }
                }
            }
        }
    });

    var config = {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
    };

    observer.observe(window.document, config);
}

chrome.storage.sync.get('enabled', function(result) {
    if (result.enabled) Observer();
});

// Eventhandler for document loaded
$(window).ready(function() {
    runningStatus(elemTags);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == 'urlChange') {
        setTimeout(function() {
            runningStatus(elemTags);
            // console.log('runningStatus was called.');
        }, 500);
    }
    sendResponse('Message received');
});
