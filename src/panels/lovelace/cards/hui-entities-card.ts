import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";

import "../../../components/ha-card.js";
import "../components/hui-entities-toggle.js";

import { fireEvent } from "../../../common/dom/fire_event.js";
import { DOMAINS_HIDE_MORE_INFO } from "../../../common/const.js";
import { HassLocalizeLitMixin } from "../../../mixins/lit-localize-mixin";
import { LovelaceCard, LovelaceConfig, EntityRow } from "../types.js";
import createRowElement from "../common/create-row-element.js";
import computeDomain from "../../../common/entity/compute_domain.js";
import processConfigEntities from "../common/process-config-entities";
import { HomeAssistant } from "../../../types.js";

interface EntityConfig {
  name?: string;
  icon?: string;
  entity: string;
  type?: string;
  secondary_info: "entity-id" | "last-changed";
  action_name?: string;
  service?: string;
  service_data?: object;
  url?: string;
}

interface Config extends LovelaceConfig {
  show_header_toggle?: boolean;
  title?: string;
  entities: EntityConfig[];
}

class HuiEntitiesCard extends HassLocalizeLitMixin(LitElement)
  implements LovelaceCard {
  protected hass?: HomeAssistant;
  protected config?: Config;
  protected configEntities?: EntityConfig[];

  // set hass(hass) {
  //   console.log("here");
  //   this._hass = hass;

  //   console.log(this.shadowRoot);
  //   console.log(
  //     this.shadowRoot && this.shadowRoot.querySelector("ha-card")
  //       ? this.shadowRoot
  //           .querySelector("ha-card")!
  //           .querySelectorAll("#states > div > *")
  //       : ""
  //   );
  //   if (this.shadowRoot && this.shadowRoot.querySelector("ha-card")) {
  //     this.shadowRoot
  //       .querySelector("ha-card")!
  //       .querySelectorAll("#states > div > *")
  //       .forEach((element: any) => {
  //         element.hass = hass;
  //       });
  //   }
  // }

  static get properties(): PropertyDeclarations {
    return {
      hass: {},
      config: {},
    };
  }

  public getCardSize() {
    if (!this.config) {
      return 0;
    }
    // +1 for the header
    return (this.config.title ? 1 : 0) + this.config.entities.length;
  }

  public setConfig(config: Config) {
    console.log(config);

    const entities = processConfigEntities(config.entities);
    for (const entity of entities) {
      if (
        entity.type === "call-service" &&
        (!entity.service ||
          !entity.name ||
          !entity.icon ||
          !entity.service_data ||
          !entity.action_name)
      ) {
        throw new Error("Missing required property when type is call-service");
      } else if (
        entity.type === "weblink" &&
        (!entity.name || !entity.icon || !entity.url)
      ) {
        throw new Error("Missing required property when type is weblink");
      }
    }

    this.config = config;
    this.configEntities = entities;
  }

  protected render() {
    if (!this.config || !this.hass) {
      return html``;
    }
    const { show_header_toggle, title } = this.config;

    return html`
      ${this.renderStyle()}
      <ha-card>
        ${
          !title && !show_header_toggle
            ? html``
            : html`
            <div class='header'>
              <div class="name">${title}</div>
              ${
                show_header_toggle === false
                  ? html``
                  : html`
                  <hui-entities-toggle
                    .hass="${this.hass}"
                    .entities="${this.configEntities!.map(
                      (conf) => conf.entity
                    )}"
                  >
                  </hui-entities-toggle>`
              }
            </div>`
        }
        <div id="states">
          ${this.configEntities!.map((entityConf) =>
            this.renderEntity(entityConf)
          )}
        </div>
      </ha-card>
    `;
  }

  private renderStyle() {
    return html`
      <style>
        ha-card {
          padding: 16px;
        }
        #states {
          margin: -4px 0;
        }
        #states > div {
          margin: 4px 0;
        }
        #states > div > * {
          overflow: hidden;
        }
        .header {
          @apply --paper-font-headline;
          /* overwriting line-height +8 because entity-toggle can be 40px height,
            compensating this with reduced padding */
          line-height: 40px;
          color: var(--primary-text-color);
          padding: 4px 0 12px;
          display: flex;
          justify-content: space-between;
        }
        .header .name {
          @apply --paper-font-common-nowrap;
        }
        .state-card-dialog {
          cursor: pointer;
        }
      </style>
    `;
  }

  private renderEntity(entityConf) {
    const element = createRowElement(entityConf);
    element.hass = this.hass;
    element.entityConf = entityConf;
    if (
      entityConf.entity &&
      !DOMAINS_HIDE_MORE_INFO.includes(computeDomain(entityConf.entity))
    ) {
      element.classList.add("state-card-dialog");
      element.onclick = this.handleClick;
    }

    return html`
      <div>
      ${element}
      </div>
    `;
  }

  private handleClick(ev: MouseEvent) {
    const config = (ev.currentTarget as any).entityConf as EntityConfig;
    const entityId = config.entity;

    fireEvent(this, "hass-more-info", { entityId });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entities-card": HuiEntitiesCard;
  }
}

customElements.define("hui-entities-card", HuiEntitiesCard);
