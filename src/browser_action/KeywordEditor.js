function loadData() {
    browser.storage.sync.get(['words'], function(result) {
        if (result.words != '        ' || undefined) $('#keywords').val(result.words);
        else $('#keywords').value = '';
    })
}

function SaveWords() {
    var words = $('#keywords').val();
    console.log(words);
    browser.storage.sync.set({
        "words": words
    });
}

function Unsaved() {
    browser.storage.sync.get('words', function(result) {
        if ($('#keywords').val() != result.words) SaveWords();

    });
}

$(document).ready(function() {
    loadData();
    $('#keywords').bind('input', Unsaved);
    $('#save-btn').bind('click', SaveWords);
    $('#keywords').fadeIn(1200);
    $('#subLogo').fadeIn(1000);
});
