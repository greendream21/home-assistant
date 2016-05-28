import Polymer from '../polymer';
import nuclearObserver from '../util/bound-nuclear-behavior';

export default new Polymer({
  is: 'stream-status',

  behaviors: [nuclearObserver],

  properties: {
    hass: {
      type: Object,
    },

    isStreaming: {
      type: Boolean,
      bindNuclear: hass => hass.streamGetters.isStreamingEvents,
    },

    hasError: {
      type: Boolean,
      bindNuclear: hass => hass.streamGetters.hasStreamingEventsError,
    },
  },

  toggleChanged() {
    if (this.isStreaming) {
      this.hass.streamActions.stop();
    } else {
      this.hass.streamActions.start();
    }
  },
});
