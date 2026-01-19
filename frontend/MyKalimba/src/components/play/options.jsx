import React from "react";

export function Options() {
  return (
    <section id="options">
      <article>
        <h2 data-i18n="option.title">Options</h2>
        <fieldset className="option-volume">
          <label htmlFor="range-volume">
            <span data-i18n="option.volume"> Volume: </span>
            <span id="range-volume-value">75</span>
            <span>%</span>
            <input
              type="range"
              min="0"
              max="100"
              defaultValue={75}
              id="range-volume"
              name="range-volume"
            />
          </label>
        </fieldset>

        <fieldset className="option-baseNote">
          <label htmlFor="range-baseNote">
            <span data-i18n="option.baseNote"> Base Note: </span>
            <span id="range-baseNote-value">
              <span>
                C<sub>4</sub>
              </span>
            </span>
          </label>
          <input
            type="range"
            min="35"
            max="46"
            defaultValue={39}
            id="range-baseNote"
            name="range-baseNote"
          />
        </fieldset>

        <fieldset className="option-keys">
          <label htmlFor="range-keys">
            <span data-i18n="option.keys"> Keys: </span>
            <span id="range-keys-value">17</span>
            <input
              type="range"
              min="8"
              max="21"
              defaultValue={17}
              id="range-keys"
              name="range-keys"
            />
          </label>
        </fieldset>

        <fieldset className="option-tune">
          <label>
            <span data-i18n="option.tune"> Tune keys: </span>
          </label>
          <div className="tune-field"></div>
        </fieldset>

        <fieldset id="arrangement-radio-list" className="option-arrangement">
          <legend data-i18n="option.arrangement"> Arrangement: </legend>
          <label
            htmlFor="Ascending"
            style={{ width: "fit-content", paddingRight: "1.4em" }}
          >
            <input
              type="radio"
              id="Ascending"
              name="arrangement"
              value="Ascending"
            />
            <span data-i18n="option.ascending">Ascending</span>
          </label>
          <label
            htmlFor="Alternating"
            style={{ width: "fit-content", paddingRight: "1.4em" }}
          >
            <input
              type="radio"
              id="Alternating"
              name="arrangement"
              value="Alternating"
              defaultChecked
            />
            <span data-i18n="option.alternating">Alternating</span>
          </label>
          <label
            htmlFor="Descending"
            style={{ width: "fit-content", paddingRight: "1.4em" }}
          >
            <input
              type="radio"
              id="Descending"
              name="arrangement"
              value="Descending"
            />
            <span data-i18n="option.descending">Descending</span>
          </label>
        </fieldset>

        <fieldset
          id="labeltype-radio-list"
          className="option-labeltype"
          style={{ display: "flex" }}
        >
          <legend data-i18n="option.labeltype"> Label Еype: </legend>
          <label htmlFor="Number" style={{ paddingRight: "1.4em" }}>
            <input
              type="radio"
              id="Number"
              name="labeltype"
              value="Number"
              defaultChecked
            />
            <span>1</span>
          </label>
          <label htmlFor="Letter" style={{ paddingRight: "1.4em" }}>
            <input type="radio" id="Letter" name="labeltype" value="Letter" />
            <span>C</span>
          </label>
          <label htmlFor="Letter_number" style={{ paddingRight: "1.4em" }}>
            <input
              type="radio"
              id="Letter_number"
              name="labeltype"
              value="Letter_number"
            />
            <span
              style={{
                fontSize: "0.5em",
                lineHeight: "1em",
                fontWeight: "bold",
                display: "inline-block",
              }}
            >
              1<br />C
            </span>
          </label>
        </fieldset>

        <fieldset className="option-soundfonts">
          <label htmlFor="soundfonts">
            <span data-i18n="option.soundfonts">Soundfonts</span>
            <small>
              (
              <a
                id="soundfonts_source"
                data-i18n="option.source"
                href="#"
                target="_blank"
                rel="noreferrer"
              >
                source
              </a>
              )
            </small>
            :
          </label>
          <select id="soundfonts" required defaultValue="FluidR3_GM">
            <option value="FluidR3_GM">FluidR3_GM</option>
            <option value="FatBoy">FatBoy</option>
            <option value="Keylimba">Keylimba</option>
          </select>
        </fieldset>

        <fieldset className="option-localization">
          <label htmlFor="localization" data-i18n="option.localization">
            Localization:
          </label>
          <select id="localization" required></select>
        </fieldset>

        <fieldset id="customization" className="option-color">
          <legend data-i18n="option.color">Color:</legend>
        </fieldset>

        <fieldset id="keyboard_control" className="option-keyboardсontrol">
          <legend data-i18n="option.keyboardсontrol">Keyboard Control:</legend>
          <div id="keyboard_schemes" style={{ display: "flex" }}></div>
          <small data-i18n="option.spaceincrease">
            The "Space" key increases the octave by 1
          </small>
        </fieldset>

        <fieldset className="option-kb_container">
          <div id="keyboard_container" className="kb_container"></div>
        </fieldset>
      </article>
    </section>
  );
}
export default Options;
