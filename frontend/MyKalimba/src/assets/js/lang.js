
var langs = [
    {code: 'ru', text: 'Russian (Русский)'},
    {code: 'en', text: 'English (English)'}, 
    {code: 'de', text: 'German (Deutsch)'}, 
    {code: 'es', text: 'Spanish (Español)'}, 
    {code: 'fr', text: 'French (Français)'}, 
    {code: 'zh-CN', text: 'Chinese (中文)'}, 
    {code: 'ar', text: 'Arabic (العربية)'}, 
    {code: 'pt', text: 'Portuguese (Português)'},
    {code: 'ja', text: 'Japanese (日本語)'},
    {code: 'id', text: 'Indonesian (Bahasa Indonesia)'},
    {code: 'vi', text: 'Vietnamese (Tiếng Việt)'}
    
];

// sắp xếp các ngôn ngữ theo thứ tự bảng chữ cái
langs.sort(function(a, b) {
    var textA = a.text.toUpperCase();
    var textB = b.text.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
});

function normalizeLangCode(code) {
    return (code || '').toString().trim().replace('_', '-').toLowerCase();
}

function findSupportedLang(code) {
    var normalized = normalizeLangCode(code);
    if (!normalized) return null;

    // Exact match first (case-insensitive)
    var exact = langs.find(function(lang) {
        return normalizeLangCode(lang.code) === normalized;
    });
    if (exact) return exact.code;

    // Fall back to base language (e.g. vi-VN -> vi)
    var base = normalized.split('-')[0];
    if (!base) return null;
    var baseMatch = langs.find(function(lang) {
        return normalizeLangCode(lang.code) === base;
    });
    return baseMatch ? baseMatch.code : null;
}

var storedLang = (window.localStorage && null !== window.localStorage.getItem("localization"))
    ? window.localStorage.getItem("localization")
    : null;

var currentLang = storedLang
    ? (findSupportedLang(storedLang) || getUserLang())
    : getUserLang();

// Trả về mã ngôn ngữ của người dùng
function getUserLang() {
    // Lấy các ngôn ngữ ưu tiên của người dùng từ navigator.languages
    var userLangs = (navigator.languages && navigator.languages.length)
        ? navigator.languages
        : [navigator.language || navigator.userLanguage || 'en'];

    // Duyệt qua các ngôn ngữ theo thứ tự ưu tiên
    for (var i = 0; i < userLangs.length; i++) {
        var supported = findSupportedLang(userLangs[i]);
        if (supported) return supported;
    }

    // Nếu không tìm thấy ngôn ngữ nào, trả về mã ngôn ngữ tiếng Anh
    return 'en';
}

// Tải ngôn ngữ mặc định (trong trường hợp ngôn ngữ được chọn không có bản địa hóa cho một số khóa)
var defaultLocalization;
$.getJSON('/lang/en.json', function(data) {
    defaultLocalization = data;
});

// Dịch toàn bộ trang sang ngôn ngữ được chỉ định
function loadLanguage(lang) {
    $.getJSON('/lang/' + lang + '.json', function(data) {
        $('html').attr('lang', lang);
        $('[data-i18n]').each(function() {
            var key = $(this).data('i18n');
            // Nếu khóa không có trong bản địa hóa, khóa được lấy từ ngôn ngữ mặc định
            $(this).text(data[key] || defaultLocalization[key]);
        });
        $('meta[name="description"]').attr('content', data["seo.description"] || defaultLocalization["seo.description"]);
    });
}

// Điền phần tử chọn ngôn ngữ trên trang với các ngôn ngữ có sẵn
function fillLangSelector() {
    const LangSelector = $('#localization');
    LangSelector.empty();
    langs.forEach(lang => {
        LangSelector.append(
            $('<option>', {
                value: lang.code,
                text: lang.text
            })
        );
    });
    LangSelector.val(currentLang);
}

$(document).ready(function() {
    // Điền phần tử chọn ngôn ngữ trên trang với các ngôn ngữ có sẵn
    fillLangSelector();

    // Tải ngôn ngữ hiện tại
    loadLanguage(currentLang);

    // Sự kiện khi thay đổi ngôn ngữ
    $('#localization').change(function () {
        currentLang = $(this).val();
        window.localStorage && window.localStorage.setItem("localization", currentLang);
        loadLanguage(currentLang);
    });
});