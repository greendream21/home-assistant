import "@polymer/app-layout/app-header-layout/app-header-layout";
import "@polymer/app-layout/app-header/app-header";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-icon-button/paper-icon-button";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../components/ha-paper-icon-button-arrow-prev";

class HassSubpage extends PolymerElement {
  static get template() {
    return html`
      <style include="ha-style"></style>
      <app-header-layout has-scrolling-region="">
        <app-header slot="header" fixed="">
          <app-toolbar>
            <ha-paper-icon-button-arrow-prev
              on-click="_backTapped"
            ></ha-paper-icon-button-arrow-prev>
            <div main-title="">[[header]]</div>
            <slot name="toolbar-icon"></slot>
          </app-toolbar>
        </app-header>

        <slot></slot>
      </app-header-layout>
    `;
  }

  static get properties() {
    return {
      header: String,
    };
  }

  _backTapped() {
    history.back();
  }
}

customElements.define("hass-subpage", HassSubpage);
