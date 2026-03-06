// Observed black hole catalog for educational presets
// © 2026 Turki Abdullah & Mashael Abdullah. All Rights Reserved

export const OBSERVED_BLACK_HOLES = {
  custom: {
    key: 'custom',
    name: 'Custom',
    type: 'User-defined',
    massSolar: null,
    massLabel: 'Custom',
    location: 'User Simulation',
    distanceFromEarth: 'N/A'
  },
  sagittariusA: {
    key: 'sagittariusA',
    name: 'Sagittarius A*',
    type: 'Supermassive Black Hole',
    massSolar: 4_300_000,
    massLabel: '4.3 million solar masses',
    location: 'Milky Way Galactic Center',
    distanceFromEarth: '~26,700 light-years'
  },
  m87: {
    key: 'm87',
    name: 'M87*',
    type: 'Supermassive Black Hole',
    massSolar: 6_500_000_000,
    massLabel: '6.5 billion solar masses',
    location: 'Messier 87 Galaxy (Virgo Cluster)',
    distanceFromEarth: '~53 million light-years'
  },
  cygnusX1: {
    key: 'cygnusX1',
    name: 'Cygnus X-1',
    type: 'Stellar-mass Black Hole',
    massSolar: 21,
    massLabel: '21 solar masses',
    location: 'Cygnus Constellation (Binary System)',
    distanceFromEarth: '~7,200 light-years'
  }
};

export const OBSERVED_BLACK_HOLE_ORDER = [
  OBSERVED_BLACK_HOLES.custom,
  OBSERVED_BLACK_HOLES.sagittariusA,
  OBSERVED_BLACK_HOLES.m87,
  OBSERVED_BLACK_HOLES.cygnusX1
];

export default OBSERVED_BLACK_HOLES;
