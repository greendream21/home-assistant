import {
  html,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
} from "lit-element";

import { HomeAssistant } from "../../../../types";
import { HASSDomEvent } from "../../../../common/dom/fire_event";
import "./hui-edit-view";
import { EditViewDialogParams } from "./show-edit-view-dialog";

declare global {
  // for fire event
  interface HASSDomEvents {
    "reload-lovelace": undefined;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "reload-lovelace": HASSDomEvent<undefined>;
  }
}

export class HuiDialogEditView extends LitElement {
  protected hass?: HomeAssistant;
  private _params?: EditViewDialogParams;

  static get properties(): PropertyDeclarations {
    return {
      hass: {},
      _params: {},
    };
  }

  public async showDialog(params: EditViewDialogParams): Promise<void> {
    this._params = params;
    await this.updateComplete;
    (this.shadowRoot!.children[0] as any).showDialog();
  }

  protected render(): TemplateResult | void {
    if (!this._params) {
      return html``;
    }
    return html`
      <hui-edit-view
        .hass="${this.hass}"
        .lovelace="${this._params.lovelace}"
        .viewIndex="${this._params.viewIndex}"
      >
      </hui-edit-view>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-edit-view": HuiDialogEditView;
  }
}

customElements.define("hui-dialog-edit-view", HuiDialogEditView);
