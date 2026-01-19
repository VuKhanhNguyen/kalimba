// NOTE: Keep this list in sync with files in /public/lang/*.json.
var langs = [
  { code: "en", text: "English (English)" },
  { code: "vi", text: "Vietnamese (Tiếng Việt)" },
];

// sắp xếp các ngôn ngữ theo thứ tự bảng chữ cái
langs.sort(function (a, b) {
  var textA = a.text.toUpperCase();
  var textB = b.text.toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
});

function normalizeLangCode(code) {
  return (code || "").toString().trim().replace("_", "-").toLowerCase();
}

function findSupportedLang(code) {
  var normalized = normalizeLangCode(code);
  if (!normalized) return null;

  // Exact match first (case-insensitive)
  var exact = langs.find(function (lang) {
    return normalizeLangCode(lang.code) === normalized;
  });
  if (exact) return exact.code;

  // Fall back to base language (e.g. vi-VN -> vi)
  var base = normalized.split("-")[0];
  if (!base) return null;
  var baseMatch = langs.find(function (lang) {
    return normalizeLangCode(lang.code) === base;
  });
  return baseMatch ? baseMatch.code : null;
}

var storedLang =
  window.localStorage && null !== window.localStorage.getItem("localization")
    ? window.localStorage.getItem("localization")
    : null;

var currentLang = storedLang
  ? findSupportedLang(storedLang) || getUserLang()
  : getUserLang();

// Trả về mã ngôn ngữ của người dùng
function getUserLang() {
  // Lấy các ngôn ngữ ưu tiên của người dùng từ navigator.languages
  var userLangs =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || "en"];

  // Duyệt qua các ngôn ngữ theo thứ tự ưu tiên
  for (var i = 0; i < userLangs.length; i++) {
    var supported = findSupportedLang(userLangs[i]);
    if (supported) return supported;
  }

  // Nếu không tìm thấy ngôn ngữ nào, trả về mã ngôn ngữ tiếng Anh
  return "en";
}

// Tải ngôn ngữ mặc định (trong trường hợp ngôn ngữ được chọn không có bản địa hóa cho một số khóa)
var defaultLocalization;

function applyLocalization(localization) {
  var data = localization || {};

  $("html").attr("lang", currentLang);
  $("[data-i18n]").each(function () {
    var key = $(this).data("i18n");
    $(this).text(
      data[key] || (defaultLocalization && defaultLocalization[key]) || "",
    );
  });
  var seoDescription =
    data["seo.description"] ||
    (defaultLocalization && defaultLocalization["seo.description"]) ||
    "";
  if (seoDescription) {
    $('meta[name="description"]').attr("content", seoDescription);
  }
}

// Dịch toàn bộ trang sang ngôn ngữ được chỉ định
function loadLanguage(lang) {
  currentLang = findSupportedLang(lang) || "en";
  $.getJSON("/lang/" + currentLang + ".json")
    .done(function (data) {
      applyLocalization(data);
    })
    .fail(function () {
      // If a translation file is missing, fall back to the default localization.
      applyLocalization(defaultLocalization);
    });
}

// Điền phần tử chọn ngôn ngữ trên trang với các ngôn ngữ có sẵn
function fillLangSelector() {
  const LangSelector = $("#localization");
  LangSelector.empty();
  langs.forEach((lang) => {
    LangSelector.append(
      $("<option>", {
        value: lang.code,
        text: lang.text,
      }),
    );
  });
  LangSelector.val(currentLang);
}

$(document).ready(function () {
  // Load default localization first, then init.
  $.getJSON("/lang/en.json")
    .done(function (data) {
      defaultLocalization = data;
    })
    .fail(function () {
      defaultLocalization = {};
    })
    .always(function () {
      fillLangSelector();
      loadLanguage(currentLang);

      $("#localization").change(function () {
        var selected = $(this).val();
        window.localStorage &&
          window.localStorage.setItem("localization", selected);
        loadLanguage(selected);
      });
    });
});
