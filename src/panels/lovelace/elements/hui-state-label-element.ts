import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  css,
  CSSResult,
} from "lit-element";

import "../../../components/entity/ha-state-label-badge";
import "../components/hui-warning";

import computeStateDisplay from "../../../common/entity/compute_state_display";
import { computeTooltip } from "../common/compute-tooltip";
import { handleClick } from "../common/handle-click";
import { longPress } from "../common/directives/long-press-directive";
import { LovelaceElement, LovelaceElementConfig } from "./types";
import { HomeAssistant } from "../../../types";
import { ActionConfig } from "../../../data/lovelace";

interface Config extends LovelaceElementConfig {
  entity: string;
  prefix?: string;
  suffix?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

@customElement("hui-state-label-element")
class HuiStateLabelElement extends LitElement implements LovelaceElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: Config;

  public setConfig(config: Config): void {
    if (!config.entity) {
      throw Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity!];

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <div
        .title="${computeTooltip(this.hass, this._config)}"
        @ha-click="${this._handleTap}"
        @ha-hold="${this._handleHold}"
        .longPress="${longPress()}"
      >
        ${this._config.prefix}${stateObj
          ? computeStateDisplay(
              this.hass.localize,
              stateObj,
              this.hass.language
            )
          : "-"}${this._config.suffix}
      </div>
    `;
  }

  private _handleTap(): void {
    handleClick(this, this.hass!, this._config!, false);
  }

  private _handleHold(): void {
    handleClick(this, this.hass!, this._config!, true);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        cursor: pointer;
      }
      div {
        padding: 8px;
        white-space: nowrap;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-state-label-element": HuiStateLabelElement;
  }
}
