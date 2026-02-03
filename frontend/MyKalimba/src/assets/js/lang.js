var langs = [
  { code: "en", text: "English (English)" },
  { code: "vi", text: "Vietnamese (Tiếng Việt)" },
];

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

  var exact = langs.find(function (lang) {
    return normalizeLangCode(lang.code) === normalized;
  });
  if (exact) return exact.code;

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

function getUserLang() {
  var userLangs =
    navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || "en"];

  for (var i = 0; i < userLangs.length; i++) {
    var supported = findSupportedLang(userLangs[i]);
    if (supported) return supported;
  }
  return "en";
}

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

function loadLanguage(lang) {
  currentLang = findSupportedLang(lang) || "en";
  $.getJSON("/lang/" + currentLang + ".json")
    .done(function (data) {
      applyLocalization(data);
    })
    .fail(function () {
      applyLocalization(defaultLocalization);
    });
}

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
