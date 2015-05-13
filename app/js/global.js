var surveyMania = {};

$.fn.textWidth = function(text, font, size) {
    $.fn.textWidth.fakeEl = $('<span>').appendTo(document.body);
    var htmlText = text || this.val() || this.text();
    htmlText = $.fn.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
    $.fn.textWidth.fakeEl.html(htmlText).css("font-family", font || this.css("font-family")).css("fontSize", size || this.css('fontSize')).css("font-weight","Bold");
    var tmp_width = $.fn.textWidth.fakeEl.width();
    $.fn.textWidth.fakeEl.remove();
    return tmp_width;
};