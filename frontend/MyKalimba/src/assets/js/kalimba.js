function saveToLocalStorage(key, value) {
  window.localStorage && window.localStorage.setItem(key, value);
}

function loadFromLocalStorage(key, default_value) {
  return window.localStorage && null !== window.localStorage.getItem(key)
    ? window.localStorage.getItem(key)
    : default_value;
}

function saveJSONToLocalStorage(key, value) {
  if (window.localStorage) {
    try {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }
}

function loadJSONFromLocalStorage(key, default_value) {
  if (window.localStorage) {
    const serializedValue = window.localStorage.getItem(key);
    if (serializedValue !== null) {
      try {
        return JSON.parse(serializedValue);
      } catch (error) {
        console.error("Error loading from localStorage:", error);
        return default_value;
      }
    }
  }
  return default_value;
}

const Soundfonts = {
  FluidR3_GM: {
    url: "https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/kalimba-mp3.js",
    sourceUrl: "https://gleitz.github.io/midi-js-soundfonts/",
    gain: 6,
  },
  FatBoy: {
    url: "https://gleitz.github.io/midi-js-soundfonts/FatBoy/kalimba-mp3.js",
    sourceUrl: "https://gleitz.github.io/midi-js-soundfonts/",
    gain: 6,
  },
  Keylimba: {
    url: "/soundfonts/keylimba/kalimba.mp3.js",
    sourceUrl: "https://keylimba.carrd.co/",
    gain: 1,
  },
};

function sortArrayKalimba(notesArr) {
  let sortedArr = [];
  for (let i = notesArr.length - (notesArr.length % 2) - 1; i > 0; i -= 2) {
    sortedArr.push(notesArr[i]);
  }
  for (let i = 0; i < notesArr.length; i += 2) {
    sortedArr.push(notesArr[i]);
  }
  return sortedArr;
}

const allNotesSharp = [
  "A0",
  "A#0",
  "B0",
  "C1",
  "C#1",
  "D1",
  "D#1",
  "E1",
  "F1",
  "F#1",
  "G1",
  "G#1",
  "A1",
  "A#1",
  "B1",
  "C2",
  "C#2",
  "D2",
  "D#2",
  "E2",
  "F2",
  "F#2",
  "G2",
  "G#2",
  "A2",
  "A#2",
  "B2",
  "C3",
  "C#3",
  "D3",
  "D#3",
  "E3",
  "F3",
  "F#3",
  "G3",
  "G#3",
  "A3",
  "A#3",
  "B3",
  "C4",
  "C#4",
  "D4",
  "D#4",
  "E4",
  "F4",
  "F#4",
  "G4",
  "G#4",
  "A4",
  "A#4",
  "B4",
  "C5",
  "C#5",
  "D5",
  "D#5",
  "E5",
  "F5",
  "F#5",
  "G5",
  "G#5",
  "A5",
  "A#5",
  "B5",
  "C6",
  "C#6",
  "D6",
  "D#6",
  "E6",
  "F6",
  "F#6",
  "G6",
  "G#6",
  "A6",
  "A#6",
  "B6",
  "C7",
  "C#7",
  "D7",
  "D#7",
  "E7",
  "F7",
  "F#7",
  "G7",
  "G#7",
  "A7",
  "A#7",
  "B7",
  "C8",
];

const keyboardKeys = {
  192: "`",
  49: "1",
  50: "2",
  51: "3",
  52: "4",
  53: "5",
  54: "6",
  55: "7",
  56: "8",
  57: "9",
  48: "0",
  189: "-",
  187: "=",
  8: "←",
  9: "Tab",
  81: "Q",
  87: "W",
  69: "E",
  82: "R",
  84: "T",
  89: "Y",
  85: "U",
  73: "I",
  79: "O",
  80: "P",
  219: "[",
  221: "]",
  220: "\\",
  20: "Caps",
  65: "A",
  83: "S",
  68: "D",
  70: "F",
  71: "G",
  72: "H",
  74: "J",
  75: "K",
  76: "L",
  186: ";",
  222: "'",
  13: "Enter",
  16: "Shift",
  90: "Z",
  88: "X",
  67: "C",
  86: "V",
  66: "B",
  78: "N",
  77: "M",
  188: ",",
  190: ".",
  191: "/",
  17: "Ctrl",
  18: "Alt",
  32: "Space",
  0: " ",
};

const keyboardKeyInfo = [
  [
    { code: 192, length: 1 },
    { code: 49, length: 1 },
    { code: 50, length: 1 },
    { code: 51, length: 1 },
    { code: 52, length: 1 },
    { code: 53, length: 1 },
    { code: 54, length: 1 },
    { code: 55, length: 1 },
    { code: 56, length: 1 },
    { code: 57, length: 1 },
    { code: 48, length: 1 },
    { code: 189, length: 1 },
    { code: 187, length: 1 },
    { code: 8, length: 2.5 },
  ],
  [
    { code: 9, length: 1.5 },
    { code: 81, length: 1 },
    { code: 87, length: 1 },
    { code: 69, length: 1 },
    { code: 82, length: 1 },
    { code: 84, length: 1 },
    { code: 89, length: 1 },
    { code: 85, length: 1 },
    { code: 73, length: 1 },
    { code: 79, length: 1 },
    { code: 80, length: 1 },
    { code: 219, length: 1 },
    { code: 221, length: 1 },
    { code: 220, length: 2 },
  ],
  [
    { code: 20, length: 2 },
    { code: 65, length: 1 },
    { code: 83, length: 1 },
    { code: 68, length: 1 },
    { code: 70, length: 1 },
    { code: 71, length: 1 },
    { code: 72, length: 1 },
    { code: 74, length: 1 },
    { code: 75, length: 1 },
    { code: 76, length: 1 },
    { code: 186, length: 1 },
    { code: 222, length: 1.05 },
    { code: 13, length: 2.5 },
  ],
  [
    { code: 16, length: 2.5 },
    { code: 90, length: 1 },
    { code: 88, length: 1 },
    { code: 67, length: 1 },
    { code: 86, length: 1 },
    { code: 66, length: 1 },
    { code: 78, length: 1 },
    { code: 77, length: 1 },
    { code: 188, length: 1 },
    { code: 190, length: 1 },
    { code: 191, length: 1 },
    { code: 16, length: 3.1 },
  ],
  [
    { code: 17, length: 1.5 },
    { code: 0, length: 1 },
    { code: 18, length: 1.5 },
    { code: 32, length: 6.3 },
    { code: 18, length: 1.5 },
    { code: 0, length: 1 },
    { code: 0, length: 1 },
    { code: 17, length: 2 },
  ],
];

const keyboardSchemes = [
  // B V N C M X < F H D J S K A U R I E O P W
  [
    66, 86, 78, 67, 77, 88, 188, 70, 72, 68, 74, 83, 75, 65, 85, 82, 73, 69, 79,
    80, 87,
  ],

  // A S D F G H J K L
  [71, 70, 72, 68, 74, 83, 75, 65, 76],

  // 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, -, =
  [49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187],
];

var isMouseDown = false;

var isSpacePressed = false;

var isRecording = false;

var isPlaying = false;

var sequence = [];

var prevTime;

$(document).on("mouseup", (event) => {
  if (event.button === 0) {
    isMouseDown = false;
  }
});

$(document).on("mousedown", (event) => {
  if (event.button === 0) {
    isMouseDown = true;
  }
});

$(document).on("keydown", function (event) {
  if (event.keyCode == 32) {
    const target = event.target;
    const isEditableTarget =
      target &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

    if (isEditableTarget) return;

    isSpacePressed = true;
    event.preventDefault();
  }
});

$(document).on("keyup", function (event) {
  if (event.keyCode == 32) {
    const target = event.target;
    const isEditableTarget =
      target &&
      (target.isContentEditable ||
        /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

    if (isEditableTarget) return;

    isSpacePressed = false;
  }
});

function updateLabels() {
  switch (kalimba_online.labelType) {
    case "Number":
      $(".note-letter").hide();
      $(".note-number").show();
      break;
    case "Letter":
      $(".note-letter").show();
      $(".note-number").hide();
      break;
    case "Letter_number":
      $(".note-letter").show();
      $(".note-number").show();
      break;
    default:
      break;
  }
}

class Kalimba_Online {
  _kalimba = {};

  get soundfont() {
    return loadFromLocalStorage("soundfont", "Keylimba");
  }
  get currentSoundfont() {
    return Soundfonts[this.soundfont];
  }
  get arrangement() {
    return loadFromLocalStorage("arrangement", "Alternating");
  }
  get keysCount() {
    return loadFromLocalStorage("keysCount", 17);
  }
  get labelType() {
    return loadFromLocalStorage("labelType", "Number");
  }
  get kalimba() {
    return this._kalimba;
  }
  get baseNote() {
    return parseInt(
      loadFromLocalStorage("baseNote", allNotesSharp.indexOf("C4")),
    );
  }
  get tunes() {
    return loadFromLocalStorage("tunes", Array(21).fill(0).join(","))
      .split(",")
      .map(Number);
  }
  get keyboardScheme() {
    return loadFromLocalStorage("keyboardScheme", 0);
  }
  get currentKeyboardScheme() {
    return keyboardSchemes[this.keyboardScheme];
  }
  get volume() {
    return loadFromLocalStorage("volume", 75);
  }
  get recordedNotes() {
    return loadJSONFromLocalStorage("recordedNotes", Array(0));
  }

  set soundfont(value) {
    saveToLocalStorage("soundfont", value);
  }
  set arrangement(value) {
    saveToLocalStorage("arrangement", value);
  }
  set keysCount(value) {
    saveToLocalStorage("keysCount", value);
  }
  set labelType(value) {
    saveToLocalStorage("labelType", value);
  }
  set kalimba(value) {
    this._kalimba = value;
  }
  set baseNote(value) {
    saveToLocalStorage("baseNote", value);
  }
  set tunes(value) {
    saveToLocalStorage("tunes", value);
  }
  set keyboardScheme(value) {
    saveToLocalStorage("keyboardScheme", value);
  }
  set volume(value) {
    saveToLocalStorage("volume", value);
  }
  set recordedNotes(value) {
    saveJSONToLocalStorage("recordedNotes", value);
  }

  constructor() {
    this.loadSF();
  }

  ifTouchscreen = false;

  lastTouchKeysPressed = [];

  _audioContext = new (window.AudioContext || window.webkitAudioContext)();

  loadSF() {
    var KalimbaSF = Soundfont.instrument(
      this._audioContext,
      this.currentSoundfont.url,
    );

    $(".kalimba-container").empty();
    $(".kalimba-container").attr("aria-busy", true);
    KalimbaSF.then((k) => {
      this.kalimba = k;
      this.addKeys();
      $(".kalimba-container").removeAttr("aria-busy");
    }).catch((error) => {
      console.error(
        "[Soundfont] Failed to load/parse soundfont:",
        this.currentSoundfont.url,
        error,
      );
      $(".kalimba-container").removeAttr("aria-busy");
      if ($(".kalimba-container .soundfont-error").length === 0) {
        $(".kalimba-container").append(
          $("<p>")
            .addClass("soundfont-error")
            .css({ padding: "0.75rem", color: "var(--secondary)" })
            .text("Could not load soundfont. Check console/network."),
        );
      }
    });
  }

  getNotes() {
    const majorIntervals = [2, 2, 1, 2, 2, 2, 1];
    const minorIntervals = [2, 1, 2, 2, 1, 2, 2];

    const notes = [];
    var currentIndex = this.baseNote;
    for (let i = 0; i < this.keysCount; i++) {
      notes.push(allNotesSharp[currentIndex + this.tunes[i]]);
      currentIndex += majorIntervals[i % 7];
    }
    return notes;
  }

  addKeys() {
    $(".kalimba-container").empty();

    let notesArray = this.getNotes();

    let sortedNotes = notesArray;

    switch (this.arrangement) {
      case "Ascending":
        sortedNotes = notesArray;
        break;
      case "Alternating":
        sortedNotes = sortArrayKalimba(notesArray);
        break;
      case "Descending":
        sortedNotes = notesArray.slice().reverse();
        break;
      default:
        sortedNotes = notesArray;
        break;
    }

    sortedNotes.forEach((note) => {
      let num = notesArray.indexOf(note);
      let labelNum = (num % 7) + 1;

      let dots = "";
      for (let i = 0; i < Math.floor(num / 7); i++) dots += ".";
      if (dots === "..") dots = ":";

      let label = dots + "\n" + labelNum;

      let keys = notesArray.length;
      let x = notesArray.indexOf(note);

      let keyHeight = 260 - 3 * (21 - keys) - 20 * Math.sqrt(x);

      let letter = note.replace(/#/g, "♯");
      let keyboardKey = this.currentKeyboardScheme[num];

      const keyZone = $("<div>")
        .addClass("key-zone")
        .attr("note", note)
        .attr("notenumber", notesArray.indexOf(note))
        .css("height", keyHeight + "px")
        .append(
          $("<div>")
            .addClass("key")
            .append(
              $("<div>")
                .addClass("note-text")
                .append(
                  $("<span>")
                    .addClass("note-keyboard-key")
                    .text(keyboardKeys[keyboardKey]),
                )
                .append($("<span>").addClass("note-number").text(label))
                .append(
                  $("<span>")
                    .addClass("note-letter")
                    .text(letter.slice(0, -1))
                    .append($("<sub>").text(letter.slice(-1))),
                ),
            ),
        );

      keyZone.on("mousedown", () => {
        if (!this.ifTouchscreen) {
          this.playSound(note);
        }
      });

      keyZone.on("mouseover", (event) => {
        if (isMouseDown && !$(event.relatedTarget).closest(keyZone).length) {
          this.playSound(note);
        }
      });

      keyZone.on("touchstart", (event) => {
        this.ifTouchscreen = true;

        // let note = $(this).attr('note');
        this.playSound(note);
        // keyShake($('.key', this));

        let key = $(event.touches[event.touches.length - 1].target);
        let i = 0;
        while (key.attr("note") === undefined && i < 2) {
          key = key.parent();
          i++;
        }
        this.lastTouchKeysPressed[event.touches.length - 1] = key.attr("note");
      });

      keyZone.on("touchmove", (event) => {
        for (let j = 0; j < event.touches.length; j++) {
          var touch = event.touches[j];
          var key = $(document.elementFromPoint(touch.clientX, touch.clientY));

          let i = 0;
          while (key.attr("note") === undefined && i < 2) {
            key = key.parent();
            i++;
            // if (i>2) console.log(i);
          }
          let note = key.attr("note");

          if (note !== undefined && !this.lastTouchKeysPressed.includes(note)) {
            this.lastTouchKeysPressed[j] = note;
            this.playSound(note);
          }
        }
      });

      $(".kalimba-container").append(keyZone);
    });

    updateLabels();
  }

  playSound(note, options = { play: true, animate: true, record: true }) {
    if (options.play) {
      // let currentVolume = this.currentSoundfont.gain * Math.log10(1 + 9 * this.volume / 100);
      let currentVolume = (this.currentSoundfont.gain * this.volume) / 100;
      this._kalimba.play(note, 0, { gain: currentVolume });
    }

    if (options.animate) {
      this.keyShake($(`.key-zone[note='${note}'] .key`));
    }
    console.log("Pressed '" + note + "' (" + allNotesSharp.indexOf(note) + ")");
    if (options.record && isRecording) {
      if (sequence.length == 0) prevTime = Date.now();
      var currentTime = Date.now();
      var timeElapsed = currentTime - prevTime;
      sequence.push({ soundId: note, time: timeElapsed });
      console.log(
        "[REC] Recorded '" +
          note +
          "' with a duration of " +
          timeElapsed +
          "ms",
      );
      prevTime = currentTime;
    }
  }
  keyShake(keyObj) {
    keyObj.removeClass("key-click");
    setTimeout(() => {
      keyObj.addClass("key-click");
    }, 1);
  }
}

let kalimba_online;

function updateKeyboardSchemes() {
  $(".key-zone").each(function () {
    var notenumberValue = $(this).attr("notenumber");
    let keyboardKey = kalimba_online.currentKeyboardScheme[notenumberValue];

    if (keyboardKey !== undefined) {
      $(this).find(".note-keyboard-key").text(keyboardKeys[keyboardKey]);
    } else {
      $(this).find(".note-keyboard-key").empty();
    }
  });
}

function updateTunes() {
  $(".tune-field").empty();
  let notesArray = kalimba_online.getNotes();
  notesArray.forEach((note, index) => {
    let letter = note.replace(/#/g, "♯");
    $("<label>", {
      class: "tune-label",
      for: "range-tune-" + index,
    })
      .append(
        $("<input>", {
          type: "range",
          min: "-1",
          max: "1",
          value: kalimba_online.tunes[index],
          id: "range-tune-" + index,
          notenumber: index,
          orient: "vertical",
        }),
        $("<span>", {
          id: "range-tune-value-" + index,
        }).append(
          $("<small>")
            .text(letter.slice(0, -1))
            .append($("<sub>").text(letter.slice(-1))),
        ),
      )
      .appendTo(".tune-field");
  });

  $("input", ".tune-label").on("input", function () {
    let notenumber = parseInt($(this).attr("notenumber"));
    let tune = parseInt($(this).val());

    let tunes = kalimba_online.tunes;
    tunes[notenumber] = tune;
    kalimba_online.tunes = tunes;
    kalimba_online.addKeys();

    let notesArray = kalimba_online.getNotes();
    let letter = notesArray[notenumber].replace(/#/g, "♯");
    $("#range-tune-value-" + notenumber)
      .empty()
      .append(
        $("<small>")
          .text(letter.slice(0, -1))
          .append($("<sub>").text(letter.slice(-1))),
      );
    kalimba_online.playSound(notesArray[notenumber], {
      play: true,
      animate: true,
      record: false,
    });
  });
}

function showKeyboardScheme(keyMapScheme) {
  $(".kb_key", ".kb_container").each(function (index, key) {
    let keycode = $(key).data("keycode");
    if (keyMapScheme.includes(keycode)) {
      $(key).addClass("used");
    } else {
      $(key).removeClass("used");
    }
  });
}

function initKalimbaUi() {
  if (!kalimba_online) {
    kalimba_online = new Kalimba_Online();
  } else {
    try {
      $(".kalimba-container").removeAttr("aria-busy");
      if (
        kalimba_online.kalimba &&
        typeof kalimba_online.addKeys === "function"
      ) {
        kalimba_online.addKeys();
      } else if (typeof kalimba_online.loadSF === "function") {
        kalimba_online.loadSF();
      }
    } catch (_) {}
  }

  $("#recordButton").click(function () {
    if (isRecording) {
      isRecording = false;
      $("#icon-record").show();
      $("#icon-spin").hide();

      if (sequence.length > 0) {
        var timeElapsed = Date.now() - prevTime;
        sequence.push({ soundId: null, time: timeElapsed });

        $("#playButton").attr("disabled", null);

        let duration = 0;
        for (let i = 0; i < sequence.length; i++) {
          duration += sequence[i].time;
        }
        duration = duration / 1000;
        $("#playButton .loader").css("--anim-load-duration", duration + "s");

        kalimba_online.recordedNotes = sequence;

        console.log(
          "[REC] Recording stopped. Total duration: " + duration + "s",
        );
        console.log("[REC] Recorded sequence:", sequence);
      }
    } else {
      isRecording = true;

      console.log("[REC] Recording started");

      sequence = [];

      $("#icon-record").hide();
      $("#icon-spin").show();

      $("#playButton").attr("disabled", "");
    }
  });

  $("#playButton").click(function () {
    if (isPlaying) {
      isPlaying = false;

      $("#icon-play").show();
      $("#icon-pause").hide();
      $("#icon-load").hide();

      $("#recordButton").attr("disabled", null);
    } else {
      isPlaying = true;
      let index = 0;

      function playNextNote() {
        if (!isPlaying) return;
        if (sequence[index].soundId != null)
          kalimba_online.playSound(sequence[index].soundId, {
            play: true,
            animate: false,
            record: false,
          });
        index = (index + 1) % sequence.length;
        setTimeout(playNextNote, sequence[index].time);
      }
      playNextNote();

      $("#icon-play").hide();
      $("#icon-pause").show();
      $("#icon-load").show();

      $("#recordButton").attr("disabled", "");
    }
  });

  if (kalimba_online.recordedNotes.length > 0) {
    sequence = kalimba_online.recordedNotes;
    $("#playButton").attr("disabled", null);

    let duration = 0;
    for (let i = 0; i < sequence.length; i++) {
      duration += sequence[i].time;
    }
    duration = duration / 1000;
    $("#playButton .loader").css("--anim-load-duration", duration + "s");
  }

  $("#range-volume").val(kalimba_online.volume);
  $("#range-volume-value").text(kalimba_online.volume);
  $("#range-volume").on("input", function () {
    kalimba_online.volume = $("#range-volume").val();
    $("#range-volume-value").text(kalimba_online.volume);
    kalimba_online.addKeys();
    updateTunes();
  });

  $("#range-keys").val(kalimba_online.keysCount);
  $("#range-keys-value").text(kalimba_online.keysCount);
  $("#range-keys").on("input", function () {
    kalimba_online.keysCount = $("#range-keys").val();
    $("#range-keys-value").text(kalimba_online.keysCount);
    kalimba_online.addKeys();
    updateTunes();
  });

  updateTunes();

  $("#range-baseNote").val(kalimba_online.baseNote);
  let letter = allNotesSharp[kalimba_online.baseNote].replace(/#/g, "♯");
  $("#range-baseNote-value")
    .empty()
    .append(
      $("<span>")
        .text(letter.slice(0, -1))
        .append($("<sub>").text(letter.slice(-1))),
    );

  $("#range-baseNote").on("input", function () {
    kalimba_online.baseNote = $("#range-baseNote").val();
    let letter = allNotesSharp[kalimba_online.baseNote].replace(/#/g, "♯");
    $("#range-baseNote-value")
      .empty()
      .append(
        $("<span>")
          .text(letter.slice(0, -1))
          .append($("<sub>").text(letter.slice(-1))),
      );
    kalimba_online.addKeys();
    kalimba_online.playSound(allNotesSharp[kalimba_online.baseNote], {
      play: true,
      animate: false,
      record: false,
    });
    updateTunes();
  });

  $("input#" + kalimba_online.arrangement).prop("checked", true);
  $("input", "#arrangement-radio-list").on("click", function () {
    kalimba_online.arrangement = $(
      "input:checked",
      "#arrangement-radio-list",
    ).attr("id");
    kalimba_online.addKeys();
  });

  $("input#" + kalimba_online.labelType).prop("checked", true);
  $("input", "#labeltype-radio-list").on("click", function () {
    kalimba_online.labelType = $("input:checked", "#labeltype-radio-list").attr(
      "id",
    );
    updateLabels();
  });

  $("#soundfonts").val(kalimba_online.soundfont);
  $("#soundfonts_source").attr(
    "href",
    kalimba_online.currentSoundfont.sourceUrl,
  );
  $("#soundfonts").change(function () {
    kalimba_online.soundfont = $(this).val();
    kalimba_online.loadSF();
    $("#soundfonts_source").attr(
      "href",
      kalimba_online.currentSoundfont.sourceUrl,
    );
  });

  $(document).on("keydown", function (event) {
    if (kalimba_online.currentKeyboardScheme.includes(event.keyCode)) {
      let keyNum = kalimba_online.currentKeyboardScheme.indexOf(event.keyCode);
      let notesArray = kalimba_online.getNotes();
      if (isSpacePressed) keyNum += 7;
      if (notesArray.hasOwnProperty(keyNum))
        kalimba_online.playSound(notesArray[keyNum]);
    }
  });

  $("#keyboard_container").empty();
  keyboardKeyInfo.forEach((row) => {
    const rowElement = $('<div class="kb_row"></div>');
    row.forEach((key) => {
      $('<div class="kb_key"></div>')
        .text(keyboardKeys[key.code])
        .css("flex-grow", key.length)
        .attr("data-keycode", key.code)
        .appendTo(rowElement);
    });
    $("#keyboard_container").append(rowElement);
  });

  $("#keyboard_schemes").empty();
  keyboardSchemes.forEach(function (_key, index) {
    $('<label style="padding-right: 1.4em;">')
      .appendTo($("#keyboard_schemes"))
      .append(
        $('<input type="radio" name="kb_scheme">')
          .attr("data-schemeid", index)
          .prop("checked", index == kalimba_online.keyboardScheme),
      )
      .append(" ")
      .append($("<span>").text(index + 1));
  });
  showKeyboardScheme(kalimba_online.currentKeyboardScheme);
  $("input#" + kalimba_online.currentKeyboardScheme).prop("checked", true);
  $("input", "#keyboard_control").on("click", function () {
    kalimba_online.keyboardScheme = $(
      "input:checked",
      "#keyboard_control",
    ).data("schemeid");
    showKeyboardScheme(kalimba_online.currentKeyboardScheme);
    updateKeyboardSchemes();
  });
}

let kalimbaUiObserver;

function initKalimbaUiWhenReady() {
  if (document.querySelector(".kalimba-container")) {
    initKalimbaUi();
    return;
  }

  if (kalimbaUiObserver) return;

  if (typeof MutationObserver === "function" && document.body) {
    kalimbaUiObserver = new MutationObserver(function () {
      if (document.querySelector(".kalimba-container")) {
        try {
          initKalimbaUi();
        } finally {
          kalimbaUiObserver.disconnect();
          kalimbaUiObserver = undefined;
        }
      }
    });

    kalimbaUiObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(
      function () {
        if (kalimbaUiObserver) {
          kalimbaUiObserver.disconnect();
          kalimbaUiObserver = undefined;
        }
      },
      10 * 60 * 1000,
    );

    return;
  }

  setTimeout(initKalimbaUiWhenReady, 200);
}

$(document).ready(function () {
  initKalimbaUiWhenReady();
});

window.addEventListener("kalimba:mount", function () {
  setTimeout(initKalimbaUiWhenReady, 0);
});
