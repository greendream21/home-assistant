import yaml from "js-yaml";

import "@polymer/paper-input/paper-textarea";

import createCardElement from "../common/create-card-element";
import createErrorCardConfig from "../common/create-error-card-config";
import { HomeAssistant } from "../../../types";
import { LovelaceCard } from "../types";
import { ConfigValue } from "./types";

export class HuiYAMLCardPreview extends HTMLElement {
  private _hass?: HomeAssistant;

  set hass(value: HomeAssistant) {
    this._hass = value;
    if (this.lastChild) {
      (this.lastChild as LovelaceCard).hass = value;
    }
  }

  set value(configValue: ConfigValue) {
    if (this.lastChild) {
      this.removeChild(this.lastChild);
    }

    if (!configValue.value || configValue.value === "") {
      return;
    }

    let conf;
    if (configValue.format === "yaml") {
      try {
        conf = yaml.safeLoad(configValue.value);
      } catch (err) {
        conf = createErrorCardConfig(`Invalid YAML: ${err.message}`, undefined);
      }
    } else {
      conf = configValue.value;
    }

    const element = createCardElement(conf);

    if (this._hass) {
      element.hass = this._hass;
    }

    this.appendChild(element);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-yaml-card-preview": HuiYAMLCardPreview;
  }
}

customElements.define("hui-yaml-card-preview", HuiYAMLCardPreview);
