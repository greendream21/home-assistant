import moment from 'moment';
import { util } from 'home-assistant-js';
import Polymer from '../polymer';

const UPDATE_INTERVAL = 60000; // 60 seconds

const { parseDateTime } = util;

export default new Polymer({
  is: 'relative-ha-datetime',

  properties: {
    datetime: {
      type: String,
      observer: 'datetimeChanged',
    },

    datetimeObj: {
      type: Object,
      observer: 'datetimeObjChanged',
    },

    parsedDateTime: {
      type: Object,
    },

    relativeTime: {
      type: String,
      value: 'not set',
    },
  },

  created() {
    this.updateRelative = this.updateRelative.bind(this);
  },

  attached() {
    this._interval = setInterval(this.updateRelative, UPDATE_INTERVAL);
  },

  detached() {
    clearInterval(this._interval);
  },

  datetimeChanged(newVal) {
    this.parsedDateTime = newVal ? parseDateTime(newVal) : null;

    this.updateRelative();
  },

  datetimeObjChanged(newVal) {
    this.parsedDateTime = newVal;

    this.updateRelative();
  },

  updateRelative() {
    this.relativeTime = this.parsedDateTime ?
      moment(this.parsedDateTime).fromNow() : '';
  },
});
