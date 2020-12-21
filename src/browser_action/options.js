function SaveUrls() {
    var urls = $('#urls').val();
    chrome.storage.sync.set({
        "urls": urls
    });
}

function loadData() {
    chrome.storage.sync.get(['urlRule', 'urls', 'blurOption', 'hoveringOption'], function(result) {
        if (result.urls != undefined) $('#urls').val(result.urls);
        else $('#urls').val('');
        $('#blurred').prop('checked', result.blurOption);
        if ($('#blurred').prop('checked')) $('#hoveringOption').css({ 'display': 'inline-block' });
        else $('#hoveringOption').css({ 'display': 'none' });
        $('#hovering').prop('checked', result.hoveringOption);
        if (result.urlRule) $('#disabler').prop('checked', result.urlRule);
        else $('#enabler').prop('checked', true);
    })
}

function Unsaved() {
    chrome.storage.sync.get('urls', function(result) {
        if ($('#urls').val() != result.urls) {
            SaveUrls();
        }
    });
}

function disablerRadio() {
    var rule = $('#disabler').prop('checked');
    chrome.storage.sync.set({
        'urlRule': rule
    });
}

function enablerRadio() {
    var rule = $('#disabler').prop('checked');
    chrome.storage.sync.set({
        'urlRule': rule
    });
}

function saveBlurOption() {
    var blurred = $('#blurred').prop('checked');
    chrome.storage.sync.set({
        'blurOption': blurred
    });
    if ($('#blurred').prop('checked')) $('#hoveringOption').fadeIn(500);
    else $('#hoveringOption').fadeOut(500);
}

function saveHoveringOption() {
    var hovering = $('#hovering').prop('checked');
    chrome.storage.sync.set({
        'hoveringOption': hovering
    });
}

function saveDisableAnimation() {
    var anim = $('#disableAnim').prop('checked');
    chrome.storage.sync.set({
        'disableAnim': anim
    });
}


$(document).ready(function() {
    loadData();
    $('#urls').bind('input', Unsaved);
    $('#blurred').bind('change', saveBlurOption);
    $('#hovering').bind('change', saveHoveringOption);
    $('#disableAnim').bind('change', saveDisableAnimation);
    $('#disabler').bind('change', disablerRadio);
    $('#enabler').bind('change', enablerRadio);
    $('#logo').fadeIn(1000);
    $('#logoLine').fadeIn(1500);
    $('#blurOption').fadeIn(1500);
    $('#hoveringOption').fadeIn(1500);
    $('.radios').fadeIn(1500);
    $('#urls').fadeIn(1500);
    $('#tip').fadeIn(2000);
});
