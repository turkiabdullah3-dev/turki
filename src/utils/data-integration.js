import { displayNASAData, displayESAData, displaySpaceWeather, displayLatestDiscoveries } from './dataDisplay.js';

document.addEventListener('DOMContentLoaded', () => {
  displayNASAData();
  displayESAData();
  displaySpaceWeather();
  displayLatestDiscoveries();
});
