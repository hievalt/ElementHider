function SaveWords() {
    var words = $('#keywords').val();
    chrome.storage.sync.set({
        "words": words
    });
    // document.getElementById('save-btn').setAttribute('style', 'display:none;');
}

function loadData() {
    chrome.storage.sync.get(['enabled', 'testingMode', 'words'], function(result) {
        if (result.words != '        ' || undefined) $('#keywords').val(result.words);
        else $('#keywords').value = '';
        $('#toggle').prop('checked', result.enabled);
        $('#toggleTesting').prop('checked', result.testingMode);
    })
}

function saveEnabled() {
    var enabled = $('#toggle').prop('checked');
    chrome.storage.sync.set({
        "enabled": enabled
    });
}

function saveTestingMode() {
    var testingMode = $('#toggleTesting').prop('checked');
    chrome.storage.sync.set({
        "testingMode": testingMode
    });
}

function Unsaved() {
    chrome.storage.sync.get('words', function(result) {
        if ($('#keywords').val() != result.words) {
            SaveWords();
            //document.getElementById('save-btn').setAttribute('style', 'display:inline-block;');
        }
        /* else {
                   document.getElementById('save-btn').setAttribute('style', 'display:none;');
               } */
    });
}

function showExamples() {
    if (document.getElementById('help').innerText == 'Show keyword examples') {
        $('#examples').fadeIn(500);
        $('#help').text('Hide keyword examples');
        $('body').animate({
                scrollTop: $(document).height() - $(window).height()
            },
            1400,
            "swing"
        );
    } else {
        $('#examples').slideUp(500);
        $('#help').text('Show keyword examples');
    }
}

function keywordEditor() {
    chrome.windows.create({
        "url": chrome.extension.getURL('src/browser_action/KeywordEditor.html'),
        'type': 'popup',
        "width": 600,
        "height": 400,
        "focused": true
    });
}

function showOptions() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else window.open(chrome.runtime.getURL('options.html'));
}

$(document).ready(function() {
    loadData();
    $('#keywords').bind('input', Unsaved);
    $('#openKeywords').bind('click', keywordEditor);
    $('#save-btn').bind('click', SaveWords);
    $('#toggle').bind('change', saveEnabled);
    $('#toggleTesting').bind('change', saveTestingMode);
    $('#help').bind('click', showExamples);
    $('#optionsIcon').bind('click', showOptions);
    // Animations
    $('#logo').slideDown(250);
    $('#logoLine').fadeIn(2500);
    $('#wordLine').fadeIn(1000);
    $('#keywords').fadeIn(1000);
    $('#onoff').fadeIn(1200);
    $('#testingMode').fadeIn(1200);
    $('#help').fadeIn(2000);
});
