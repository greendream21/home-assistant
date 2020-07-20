import "@polymer/paper-dropdown-menu/paper-dropdown-menu-light";
import "../../../../components/ha-icon-button";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@material/mwc-list/mwc-list-item";
import "../../../../components/ha-button-menu";
import { mdiDotsVertical } from "@mdi/js";
import type { PaperListboxElement } from "@polymer/paper-listbox/paper-listbox";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  internalProperty,
} from "lit-element";
import { dynamicElement } from "../../../../common/dom/dynamic-element-directive";
import { fireEvent } from "../../../../common/dom/fire_event";
import "../../../../components/ha-card";
import type { Trigger } from "../../../../data/automation";
import { showConfirmationDialog } from "../../../../dialogs/generic/show-dialog-box";
import type { HomeAssistant } from "../../../../types";
import "./types/ha-automation-trigger-device";
import "./types/ha-automation-trigger-event";
import "./types/ha-automation-trigger-geo_location";
import "./types/ha-automation-trigger-homeassistant";
import "./types/ha-automation-trigger-mqtt";
import "./types/ha-automation-trigger-numeric_state";
import "./types/ha-automation-trigger-state";
import "./types/ha-automation-trigger-sun";
import "./types/ha-automation-trigger-template";
import "./types/ha-automation-trigger-time";
import "./types/ha-automation-trigger-time_pattern";
import "./types/ha-automation-trigger-webhook";
import "./types/ha-automation-trigger-zone";

const OPTIONS = [
  "device",
  "event",
  "state",
  "geo_location",
  "homeassistant",
  "mqtt",
  "numeric_state",
  "sun",
  "template",
  "time",
  "time_pattern",
  "webhook",
  "zone",
];

export interface TriggerElement extends LitElement {
  trigger: Trigger;
}

export const handleChangeEvent = (element: TriggerElement, ev: CustomEvent) => {
  ev.stopPropagation();
  const name = (ev.target as any)?.name;
  if (!name) {
    return;
  }
  const newVal = ev.detail.value;

  if ((element.trigger[name] || "") === newVal) {
    return;
  }

  let newTrigger: Trigger;
  if (!newVal) {
    newTrigger = { ...element.trigger };
    delete newTrigger[name];
  } else {
    newTrigger = { ...element.trigger, [name]: newVal };
  }
  fireEvent(element, "value-changed", { value: newTrigger });
};

@customElement("ha-automation-trigger-row")
export default class HaAutomationTriggerRow extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public trigger!: Trigger;

  @internalProperty() private _yamlMode = false;

  protected render() {
    const selected = OPTIONS.indexOf(this.trigger.platform);
    const yamlMode = this._yamlMode || selected === -1;

    return html`
      <ha-card>
        <div class="card-content">
          <div class="card-menu">
            <ha-button-menu corner="BOTTOM_START">
              <mwc-icon-button
                slot="trigger"
                .title=${this.hass.localize("ui.common.menu")}
                .label=${this.hass.localize("ui.common.overflow_menu")}
                ><ha-svg-icon path=${mdiDotsVertical}></ha-svg-icon
              ></mwc-icon-button>
              <mwc-list-item
                @request-selected=${this._switchYamlMode}
                .disabled=${selected === -1}
              >
                ${yamlMode
                  ? this.hass.localize(
                      "ui.panel.config.automation.editor.edit_ui"
                    )
                  : this.hass.localize(
                      "ui.panel.config.automation.editor.edit_yaml"
                    )}
              </mwc-list-item>
              <mwc-list-item disabled>
                ${this.hass.localize(
                  "ui.panel.config.automation.editor.actions.duplicate"
                )}
              </mwc-list-item>
              <mwc-list-item @request-selected=${this._onDelete}>
                ${this.hass.localize(
                  "ui.panel.config.automation.editor.actions.delete"
                )}
              </mwc-list-item>
            </ha-button-menu>
          </div>
          ${yamlMode
            ? html`
                <div style="margin-right: 24px;">
                  ${selected === -1
                    ? html`
                        ${this.hass.localize(
                          "ui.panel.config.automation.editor.triggers.unsupported_platform",
                          "platform",
                          this.trigger.platform
                        )}
                      `
                    : ""}
                  <ha-yaml-editor
                    .defaultValue=${this.trigger}
                    @value-changed=${this._onYamlChange}
                  ></ha-yaml-editor>
                </div>
              `
            : html`
                <paper-dropdown-menu-light
                  .label=${this.hass.localize(
                    "ui.panel.config.automation.editor.triggers.type_select"
                  )}
                  no-animations
                >
                  <paper-listbox
                    slot="dropdown-content"
                    .selected=${selected}
                    @iron-select=${this._typeChanged}
                  >
                    ${OPTIONS.map(
                      (opt) => html`
                        <paper-item .platform=${opt}>
                          ${this.hass.localize(
                            `ui.panel.config.automation.editor.triggers.type.${opt}.label`
                          )}
                        </paper-item>
                      `
                    )}
                  </paper-listbox>
                </paper-dropdown-menu-light>
                <div>
                  ${dynamicElement(
                    `ha-automation-trigger-${this.trigger.platform}`,
                    { hass: this.hass, trigger: this.trigger }
                  )}
                </div>
              `}
        </div>
      </ha-card>
    `;
  }

  private _onDelete() {
    showConfirmationDialog(this, {
      text: this.hass.localize(
        "ui.panel.config.automation.editor.triggers.delete_confirm"
      ),
      dismissText: this.hass.localize("ui.common.no"),
      confirmText: this.hass.localize("ui.common.yes"),
      confirm: () => {
        fireEvent(this, "value-changed", { value: null });
      },
    });
  }

  private _typeChanged(ev: CustomEvent) {
    const type = ((ev.target as PaperListboxElement)?.selectedItem as any)
      ?.platform;

    if (!type) {
      return;
    }

    const elClass = customElements.get(`ha-automation-trigger-${type}`);

    if (type !== this.trigger.platform) {
      fireEvent(this, "value-changed", {
        value: {
          platform: type,
          ...elClass.defaultConfig,
        },
      });
    }
  }

  private _onYamlChange(ev: CustomEvent) {
    ev.stopPropagation();
    if (!ev.detail.isValid) {
      return;
    }
    fireEvent(this, "value-changed", { value: ev.detail.value });
  }

  private _switchYamlMode() {
    this._yamlMode = !this._yamlMode;
  }

  static get styles(): CSSResult {
    return css`
      .card-menu {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 3;
        --mdc-theme-text-primary-on-background: var(--primary-text-color);
      }
      .rtl .card-menu {
        right: auto;
        left: 0;
      }
      ha-button-menu {
        margin: 8px;
      }
      mwc-list-item[disabled] {
        --mdc-theme-text-primary-on-background: var(--disabled-text-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-automation-trigger-row": HaAutomationTriggerRow;
  }
}
