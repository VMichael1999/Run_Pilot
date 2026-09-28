// El mock oficial de Reanimated 4 no trae useReducedMotion ("ADD ME IF NEEDED").
const Reanimated = require('react-native-reanimated/mock');

module.exports = {
  ...Reanimated,
  useReducedMotion: () => false,
};
