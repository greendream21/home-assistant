import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-card/paper-card.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../../src/components/buttons/ha-call-api-button.js';
import '../../src/components/hassio-card-content.js';
import '../../src/resources/hassio-style.js';

class HassioHassUpdate extends PolymerElement {
  static get template() {
    return html`
    <style include="ha-style hassio-style">
      paper-card {
        display: block;
        height: 100%;
        margin-bottom: 32px;
      }
      .errors {
        color: var(--google-red-500);
        margin-top: 16px;
      }
    </style>
    <template is="dom-if" if="[[computeUpdateAvailable(hassInfo)]]">
      <div class="content">
        <div class="card-group">
          <div class="title">Update available! 🎉</div>
          <paper-card>
            <div class="card-content">
              <hassio-card-content title="Home Assistant [[hassInfo.last_version]] is available" description="You are currently running version [[hassInfo.version]]" icon="mdi:home-assistant" icon-class="hassupdate"></hassio-card-content>
              <template is="dom-if" if="[[error]]">
                <div class="error">Error: [[error]]</div>
              </template>
            </div>
            <div class="card-actions">
              <ha-call-api-button hass="[[hass]]" path="hassio/homeassistant/update">Update</ha-call-api-button>
              <a href="https://github.com/home-assistant/home-assistant/releases" target="_blank"><paper-button>Release notes</paper-button></a>
            </div>
          </paper-card>
        </div>
      </div>
    </template>
`;
  }

  static get is() { return 'hassio-hass-update'; }

  static get properties() {
    return {
      hass: Object,
      hassInfo: Object,
      error: String,
    };
  }

  ready() {
    super.ready();
    this.addEventListener('hass-api-called', ev => this.apiCalled(ev));
  }

  apiCalled(ev) {
    if (ev.detail.success) {
      this.errors = null;
      return;
    }

    const response = ev.detail.response;

    if (typeof response.body === 'object') {
      this.errors = response.body.message || 'Unknown error';
    } else {
      this.errors = response.body;
    }
  }

  computeUpdateAvailable(hassInfo) {
    return hassInfo.version !== hassInfo.last_version;
  }
}

customElements.define(HassioHassUpdate.is, HassioHassUpdate);
